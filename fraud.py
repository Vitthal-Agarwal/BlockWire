from flask import Flask, request, jsonify
from langchain_cerebras import ChatCerebras

app = Flask(__name__)

# Initialize the Cerebras model
llm = ChatCerebras(
    model="llama3.1-8b",
    api_key="your_api_key_here",
    model_kwargs={"response_format": {"type": "json_object"}}
)

@app.route("/eval_transaction", methods=['POST'])
def eval_transaction():
    new_transaction = request.get_json()
    prompt = create_json_prompt([], new_transaction)  # Assuming no previous transactions for simplicity
    response = llm.invoke(prompt)
    json_response = response.json()  # Assuming response is already in JSON format
    return jsonify(json_response)

def create_json_prompt(transactions, latest_transaction):
    return f"""You are an AI designed to analyze financial transactions...
    Latest Transaction: {latest_transaction}
    Please provide your response as a JSON with no other output:
    {{
        "isSuspicious": true or false,
        "reason": "Reason why the transaction is suspicious"
    }}
    Answer: """

if __name__ == '__main__':
    app.run(port=5000)
