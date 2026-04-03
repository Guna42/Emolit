import chromadb
import os

path = r"c:\Users\GUNA\Videos\Projects\Emolit\rag_system\chroma_db"
client = chromadb.PersistentClient(path=path)
print(f"Client initialized at {path}")
collections = client.list_collections()
print(f"Collections: {collections}")
