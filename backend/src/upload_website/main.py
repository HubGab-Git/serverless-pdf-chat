import os, json
import boto3
import requests
from aws_lambda_powertools import Logger
from bs4 import BeautifulSoup
from datetime import datetime
import shortuuid

DOCUMENT_TABLE = os.environ["DOCUMENT_TABLE"]
MEMORY_TABLE = os.environ["MEMORY_TABLE"]
QUEUE = os.environ["QUEUE"]
BUCKET = os.environ["BUCKET"]
AWS_SESSION_TOKEN = os.environ.get('AWS_SESSION_TOKEN')

ddb = boto3.resource("dynamodb")
document_table = ddb.Table(DOCUMENT_TABLE)
memory_table = ddb.Table(MEMORY_TABLE)
sqs = boto3.client("sqs")
s3 = boto3.client("s3")
logger = Logger()


def s3_key_exists(bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except:
        return False

def download_html(url):
    params={
        'name': 'mp-credentials',
        'withDecryption': 'true'
    }
    parameterStoreURL= 'http://localhost:2773/systemsmanager/parameters/get'
    headers = {'X-Aws-Parameters-Secrets-Token': AWS_SESSION_TOKEN}
    response = requests.get(parameterStoreURL, params=params, headers=headers).json()
    # logger.info(f"type of response: {type(response)}")
    # logger.info(f"response: {response}")
    credentials = json.loads(response["Parameter"]['Value'])
    # logger.info(f"credentials: {credentials}")
    with requests.Session() as session:
        # Logowanie (przykład dla podstawowej autoryzacji HTTP)
        #session.auth = (credentials['username'], credentials['password'])

        # Alternatywnie, dla formularza logowania:
        login_data = {
            'login_submitted': 1,
            'email': credentials['username'],
            'password': credentials['password']
        }
        loginResult=session.post('https://secure.mp.pl/konto/logowanie', data=login_data)

        # logger.debug(f"Login Result: {loginResult.text}")

        # Pobranie strony
        response = session.get(url)

        if response.status_code != 200:
            raise Exception(f"Błąd podczas pobierania strony: {response.status_code}")

    soup = BeautifulSoup(response.text, 'html.parser')
    div = soup.find('div', class_="col-sm-8 center-box")
    raw_text = div.get_text().replace("początek strony", "")

    logger.info(
        {
            "div": div,
            "text": raw_text,
        }
    )

    h1 = soup.find('h1')
    title = ''
    if h1:
        title= h1.get_text().replace("\n", "")
        title = title.replace(" ","_")
    else:
        raise Exception("Nie znaleziono znacznika <h1>")


    return raw_text,title

@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    user_id = event["requestContext"]["authorizer"]["claims"]["sub"]
    url = event["queryStringParameters"]["url"]
    document_id = shortuuid.uuid()
    conversation_id = shortuuid.uuid()
    timestamp = datetime.utcnow()
    timestamp_str = timestamp.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    html ,title = download_html(url)

    logger.info(f"html: \n{html}")
    exists = s3_key_exists(BUCKET, f"{user_id}/{title}/{title}")
    bytes = len(html.encode('utf-8'))
    megaBytes = int(bytes / (1024 * 1024))
    
    logger.info(
        {
            "user_id": user_id,
            "url": url,
            "exists": exists,
            "tile": title
        }
    )

    if exists:
        suffix = shortuuid.ShortUUID().random(length=4)
        key = f"{user_id}/{title}-{suffix}/{title}-{suffix}"
    else:
        key = f"{user_id}/{title}/{title}"

    logger.info(
        {
            "user_id": user_id,
            "url": url,
            "exists": exists,
            "tile": title,
            "Bucket": BUCKET,
            "s3_key": key,
            "html": html
        }
    )

    s3.put_object(Bucket=BUCKET, Key=key, Body=html.encode('utf-8'))
    logger.info(f"saved to {key}")

    document = {
        "userid": user_id,
        "documentid": document_id,
        "filename": title,
        "created": timestamp_str,
        "pages": "0",
        "filesize": megaBytes,
        "docstatus": "UPLOADED",
        "conversations": [],
    }

    conversation = {"conversationid": conversation_id, "created": timestamp_str}
    document["conversations"].append(conversation)

    document_table.put_item(Item=document)

    conversation = {"SessionId": conversation_id, "History": []}
    memory_table.put_item(Item=conversation)

    message = {
        "documentid": document_id,
        "key": key,
        "user": user_id,
    }
    sqs.send_message(QueueUrl=QUEUE, MessageBody=json.dumps(message))
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps({"website_uploaded": url}),
    }