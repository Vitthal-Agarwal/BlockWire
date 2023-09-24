import requests
import json
from hedera import (
    Hbar,
    AccountCreateTransaction,
    AccountBalanceQuery,
    PrivateKey,
    Client
)

# CAPITAL ONE SETUP
customerId = 'your customerId here'
apiKey = 'http://api.nessieisreal.com/'
url = 'http://api.reimaginebanking.com/customers/{}/accounts?key={}'.format(customerId,apiKey)

payload = {
    "type": "Savings",
    "nickname": "test",
    "rewards": 10000,
    "balance": 10000,
}

# HEDERA SETUP
myAccountId = "YOUR_HEDERA_ACCOUNT_ID"
myPrivateKey = "YOUR_HEDERA_PRIVATE_KEY"
client = Client.forTestnet()
client.setOperator(myAccountId, myPrivateKey)

def create_account():
    # Create a Savings Account with Capital One API
    response = requests.post(
        url, 
        data=json.dumps(payload),
        headers={'content-type':'application/json'},
    )

    if response.status_code == 201:
        print('Capital One: account created')
        
        # Record the creation on Hedera Blockchain
        newAccountPrivateKey = PrivateKey.generate()
        newAccountPublicKey = newAccountPrivateKey.publicKey
        
        # Create a new Hedera account to represent this
        transactionId = AccountCreateTransaction().setKey(newAccountPublicKey).setInitialBalance(Hbar.fromTinybars(1000)).execute(client)
        receipt = transactionId.getReceipt(client)
        newAccountId = receipt.accountId
        
        print(f'Hedera: new account {newAccountId} created to represent the Capital One savings account.')
    else:
        print('Capital One: account creation failed.')

create_account()
