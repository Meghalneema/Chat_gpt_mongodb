# from flask import Flask, render_template, request, jsonify, url_for, redirect
# import os
# from werkzeug.utils import secure_filename
# from PyPDF2 import PdfReader
# from langchain.embeddings.openai import OpenAIEmbeddings
# from langchain.text_splitter import CharacterTextSplitter
# from langchain.vectorstores import FAISS
# from langchain.chains.question_answering import load_qa_chain
# from langchain.llms import OpenAI
# import fitz
# import os
# from api import API_KEY  # Import the API_KEY from api.py

# app = Flask(__name__)
# os.environ["OPENAI_API_KEY"] = API_KEY

# @app.route('/submit', methods=['POST'])
# def submit_data():
#     data = request.get_json()
#     user_query = data.get('query')
#     file = data.get('file', {})

#     file_path = file.get('path', '')
    
#     print("file_path "+ file_path)
#     if not file_path.endswith('.pdf'):
#         response_data = {
#             "query": " ",
#             "answer": "The uploaded file is not a PDF.",
#         }
#     else:
#         try:
#             doc = fitz.open(file_path)            
#             raw_text = ''
#             for page in doc:                     
#                 text = page.get_text()           
#                 if text:
#                     raw_text += text

#             text_splitter = CharacterTextSplitter(
#                 separator="\n",
#                 chunk_size=1000,
#                 chunk_overlap=200,
#                 length_function=len,
#             )

#             texts = text_splitter.split_text(raw_text)
#             embeddings = OpenAIEmbeddings()             
#             docsearch = FAISS.from_texts(texts, embeddings)   
#             chain = load_qa_chain(OpenAI(), chain_type="stuff")
#             docs = docsearch.similarity_search(user_query)
#             answer = chain.run(input_documents=docs, question=user_query)

#             response_data = {
#             "query": user_query,
#             "answer": answer,
#         }
#         #     response_data = {
#         #     "query": user_query,
#         #     "answer": "hello world",
#         # }
#         except Exception as e:
#             print(f"Error: {str(e)}")
#             response_data = {
#             "query": user_query,
#             "answer": "An error occurred."+e,
#             }
#     # Send a JSON response back to Express.js
#     return jsonify(response_data)

# if __name__ == '__main__':
#     app.run(debug=True)  


# ====================================

from flask import Flask, render_template, request, jsonify, url_for, redirect
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
import fitz
import os
from api import API_KEY  # Import the API_KEY from api.py
from api import Firebase_Storage_Url  # Import the Firebase_Storage_Url from api.py
import requests

app = Flask(__name__)
os.environ["OPENAI_API_KEY"] = API_KEY

# Initialize Firebase Storage URL
firebase_storage_url = Firebase_Storage_Url    #"gs://chatgptpdf-56247.appspot.com"

@app.route('/submit', methods=['POST'])
def submit_data():
    try:
        user_query = request.json.get('query')
        file_url = request.json.get('filePath')  # Retrieve the file URL from the request
        #print("Received data - Query:", user_query, "File URL:", file_url)

        # Download the file from the URL
        response = requests.get(file_url)
        file_content = response.content

        # Perform operations using file_content and user_query
        doc = fitz.open("pdf_document.pdf", stream=file_content)  # Save the content to a temporary file
        raw_text = ''
        for page in doc:                     
            text = page.get_text()           
            if text:
                raw_text += text

        # Split text into chunks
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

        texts = text_splitter.split_text(raw_text)
        
        # Extract embeddings from text chunks
        embeddings = OpenAIEmbeddings()             
        docsearch = FAISS.from_texts(texts, embeddings)   

        # Load question-answering chain
        chain = load_qa_chain(OpenAI(), chain_type="stuff")
        
        # Perform similarity search
        docs = docsearch.similarity_search(user_query)
        
        # Run question-answering chain on the retrieved documents
        answer = chain.run(input_documents=docs, question=user_query)

        response_data = {
            "query": user_query,
            "answer": answer,
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        response_data = {
            "query": user_query,
            "answer": "An error occurred." + str(e),
        }

    # Send a JSON response back to Node.js
    return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True)


