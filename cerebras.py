import json
from typing import Dict

from flask import Flask, request, jsonify
from langchain_cerebras import ChatCerebras
from pymongo import MongoClient

# Flask App
app = Flask(__name__)

# Create LLM object for Cerebras
llm = ChatCerebras(
    model="llama3.1-8b",  # Two options: llama3.1-8b and llama3.1-70b
    api_key="your_api_key_here",  # Your API key
    model_kwargs={
        "response_format": {"type": "json_object"}
    },  # Always return only JSON objects
)

llm.bind(
    response_format={"type": "json_object"},  # Always return only JSON objects
    stream=False,  # Not compatible with JSON-only option according to docs
)

# Establish connection with MongoDB
client = MongoClient("mongodb+srv://vitthalagarwal:vitthal914@cluster0.g7rnb.mongodb.net/")
db = client["test"]
transactions_collection = db["transactions"]

# Receives a new transaction, retrieves previous transactions and passes to Cerebras API for fraud detection
@app.route("/eval_transaction", methods=['POST'])
def eval_transaction():
    new_transaction = request.get_json()

    user_id = new_transaction.get('senderAccountId')  # Assuming we use senderAccountId as user ID

    # Find previous transactions of given user
    transactions = list(
        transactions_collection.find({"senderAccountId": user_id})
        .sort("transactionDate", -1)
        .limit(100)
    )
    transactions = (
        "No previous transactions."
        if not transactions
        else [t for t in transactions]
    )

    prompt = create_json_prompt(
        transactions, new_transaction
    )  # Create prompt based on current transaction

    max_retries = 5  # Limit for valid JSON responses from calling Cerebras API
    valid_response = False

    for attempt in range(max_retries):
        try:
            print(f"Attempt {attempt + 1}")
            response = llm.invoke(prompt)  # Send to LLM
            json_response = json.loads(
                response.content
            )  # Extract content and load into JSON object

            if (
                isinstance(json_response, dict) and "isSuspicious" in json_response
            ):  # If valid JSON response
                valid_response = True  # Stop sending more prompts to LLM
                break

        except json.JSONDecodeError:
            print(f"Attempt {attempt + 1} failed: Response is not valid JSON")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")

    if not valid_response:
        # No valid response received (Likely causes are API down or harmful words inside description)
        print("All attempts failed, flagging as suspicious")
        isSuspicious = True
        reason = "AI model did not provide a valid response."
    else:
        # Valid response received, extract isSuspicious and reason
        isSuspicious = json_response["isSuspicious"]
        reason = json_response.get("reason", "")

    # Send back isSuspicious and reason
    response_data = {
        "isSuspicious": isSuspicious,
        "reason": reason,
    }

    return jsonify(response_data)

def create_json_prompt(transactions: list, latest_transaction: Dict):
    prompt = f"""You are an AI designed to analyze financial transactions and determine if they are suspicious.
Based on the user's previous transaction history and the latest transaction, focusing on transaction amount,
description, transaction date, recipient bank account ID. Output your decision in JSON format.

Previous Transactions:
{transactions}

Latest Transaction:
{latest_transaction}

Please provide your response as a JSON with no other output:
{{
    "isSuspicious": true or false,
    "reason": "Reason why the transaction is suspicious"
}}

Answer:
"""
    return prompt

if __name__ == '__main__':
    app.run(port=5000)
