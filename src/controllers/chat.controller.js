import { PromptTemplate } from "@langchain/core/prompts"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { retriver } from "./uploaad.controller.js";
import { combineDocuments } from "../utils/combineDocuments.js";
import {formatConvHistory} from "../utils/formatConvHistory.js"
 




const processQuestion = async (req, res) => {
    try {
        
        const llm = new ChatGoogleGenerativeAI({
            modelName: "gemini-pro",
            maxOutputTokens: 2048,
            safetySettings: [{
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            }],
            apiKey: "AIzaSyBCN-oAqOV4uvrOLPTUgppeE3DOHrpgxM8"
        });
  
        const standaloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question to a standalone question. 
            conversation history: {conv_history}
            question: {question} 
            standalone question:`
        const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate)
  
        const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Pdf uploaded by user based on the context provided and the conversation history. Try to find the answer in the context. If the answer is not given in the context, find the answer in the conversation history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email chatPDF@gmail.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
            context: {context}
            conversation history: {conv_history}
            question: {question}
            answer: `
        const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
  
        const standaloneQuestionChain = standaloneQuestionPrompt
            .pipe(llm)
            .pipe(new StringOutputParser())
  
        const retrieverChain = RunnableSequence.from([
            prevResult => prevResult.standalone_question,
            retriver,
            combineDocuments
        ])
  
        const answerChain = answerPrompt
            .pipe(llm)
            .pipe(new StringOutputParser())
  
        const chain = RunnableSequence.from([
            {
                standalone_question: standaloneQuestionChain,
                original_input: new RunnablePassthrough()
            },
            {
                context: retrieverChain,
                question: ({ original_input }) => original_input.question,
                conv_history: ({ original_input }) => original_input.conv_history
            },
            answerChain
        ])
  
        const convHistory = []
  
        const question = req.body.question;
        const response = await chain.invoke({
            question: question,
            conv_history: formatConvHistory(convHistory)
        })
  
        convHistory.push(question)
        convHistory.push(response)
  
        res.json({ response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  export {processQuestion}
