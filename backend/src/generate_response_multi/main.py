import os, json
import boto3
from aws_lambda_powertools import Logger
from langchain.llms.bedrock import Bedrock
from langchain.memory.chat_message_histories import DynamoDBChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain.embeddings import BedrockEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain


MEMORY_TABLE = os.environ["MEMORY_TABLE"]
BUCKET = os.environ["BUCKET"]


s3 = boto3.client("s3")
logger = Logger()


@logger.inject_lambda_context(log_event=True)
def lambda_handler(event, context):
    event_body = json.loads(event["body"])
    file_names = event_body["fileName"]
    logger.info({"file_names": file_names})
    human_input = event_body["prompt"]
    # conversation_id = event["pathParameters"]["conversationid"]
    conversation_id = event_body["conversationId"]
    

    user = event["requestContext"]["authorizer"]["claims"]["sub"]

    # faiss_files = ["index1.faiss", "index2.faiss"]
    # pkl_files = ["index1.pkl", "index2.pkl"]

    for file_name in file_names:
        s3.download_file(BUCKET, f"{user}/{file_name}/index.faiss", f"/tmp/{file_name}.faiss")
        s3.download_file(BUCKET, f"{user}/{file_name}/index.pkl", f"/tmp/{file_name}.pkl")

    # s3.download_file(BUCKET, f"{user}/{file_name}/index.faiss", "/tmp/index.faiss")
    # s3.download_file(BUCKET, f"{user}/{file_name}/index.pkl", "/tmp/index.pkl")

    bedrock_runtime = boto3.client(
        service_name="bedrock-runtime",
        region_name="us-east-1",
    )

    embeddings, llm = BedrockEmbeddings(
        model_id="amazon.titan-embed-text-v1",
        client=bedrock_runtime,
        region_name="us-east-1",
    ), Bedrock(
        model_id="anthropic.claude-v2", client=bedrock_runtime, region_name="us-east-1",
        model_kwargs={"temperature": 0.1}
    )

    for index, file_name in enumerate(file_names):
        if index == 0:
            faiss_index = FAISS.load_local("/tmp", embeddings, file_name)
        else:
            faiss_index_i = FAISS.load_local("/tmp", embeddings, file_name)
            faiss_index.merge_from(faiss_index_i)

    # faiss_index = FAISS.load_local("/tmp", embeddings)

    message_history = DynamoDBChatMessageHistory(
        table_name=MEMORY_TABLE, session_id=conversation_id
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        chat_memory=message_history,
        input_key="question",
        output_key="answer",
        return_messages=True,
    )

    # qa = ConversationalRetrievalChain.from_llm(
    #     llm=llm,
    #     retriever=faiss_index.as_retriever(),
    #     memory=memory,
    #     return_source_documents=True,
    # )

    qa = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=faiss_index.as_retriever(),
        memory=memory,
        return_source_documents=True,
    )
    res = qa({"question": human_input})

    logger.info(res)

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
        },
        "body": json.dumps(res["answer"]),
    }
