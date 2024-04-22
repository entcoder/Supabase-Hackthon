import multer from "multer";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import {createClient} from '@supabase/supabase-js'
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from "langchain/document_loaders/fs/pdf";


const sbUrl='https://fbhxiukmxcsciicifvrm.supabase.co'
const sbApiKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiaHhpdWtteGNzY2lpY2lmdnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM1MDY3NTQsImV4cCI6MjAyOTA4Mjc1NH0.6wSetZ8nPfKsePVwjFswBqCMYqO11APms8qkyHes3zI'


const storage = multer.diskStorage({
 destination: function (req, file, cb) {
    const dir = "./public/pdfs";
    fs.mkdirSync(dir, { recursive: true }); // This will create the directory if it doesn't exist
    cb(null, dir);
 },
 filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
 },
});

const upload = multer({
    storage: storage,
    limits: {
       fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
    },
    fileFilter: function (req, file, cb) {
       if (file.mimetype !== 'application/pdf') {
         return cb(new Error('Only PDF files are allowed!'), false);
       }
       cb(null, true);
    },
   });


   let documentsUploaded = false;
   let retriver = () => {
    if (!documentsUploaded) {
        throw new Error('No documents have been uploaded yet.');
    }
    // Assuming vectorStore.asRetriever() returns a function that can be called directly
    // If not, you might need to adjust this part based on the actual implementation
    return vectorStore.asRetriever();
   };



const uploadFile= async (req,res)=>{

    
    try {
        const filePath= req.file.path

        const loader = new PDFLoader(filePath);
        const docs = await loader.load();  
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50, 
          });
        
          const splittedDocs = await splitter.splitDocuments(docs);
          

          const googleEmbeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001", // 768 dimensions
            taskType: TaskType.RETRIEVAL_DOCUMENT,
            title: "Document title",
            apiKey:"AIzaSyBCN-oAqOV4uvrOLPTUgppeE3DOHrpgxM8"
          });

          const client= createClient(sbUrl, sbApiKey)

         const vectorStore= await SupabaseVectorStore.fromDocuments(
          splittedDocs,
           googleEmbeddings, 
           {
                  client,
                  tableName: 'documents',
           }
       );

        documentsUploaded = true;

        // Update the retriver function with the new retriever
        retriver = vectorStore.asRetriever();
        res.status(200).send({ message: 'File uploaded successfully!' });
    

    } catch (error) {
        
        if (req.error) {
            // Check if the error is due to file size limit
            if (req.error.code === 'LIMIT_FILE_SIZE') {
                res.status(400).send({ error: 'File size limit exceeded. Please upload a file smaller than 10MB.' });
            } else {
                // Handle other errors
                res.status(400).send({ error: req.error.message });
            }
        }
        console.log(error)
    }
}


export {uploadFile,upload,retriver}