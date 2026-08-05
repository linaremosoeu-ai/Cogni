import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.primaryModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-1.5-flash-8b';
  }

  async generateContent(prompt, useModel = this.primaryModel) {
    try {
      const model = genAI.getGenerativeModel({ model: useModel });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error(`Error with model ${useModel}:`, error.message);
      if (useModel === this.primaryModel) {
        console.log(`Falling back to ${this.fallbackModel}...`);
        return this.generateContent(prompt, this.fallbackModel);
      }
      throw error;
    }
  }

  async extractConceptsFromText(text) {
    const prompt = `Extract key concepts, definitions, and relationships from the following text. Return as JSON with structure: { concepts: [{name, definition, relatedTopics: []}], keyTerms: [{term, frequency, importance}] }

Text:
${text}

Return ONLY valid JSON, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse concepts:', e);
      return { concepts: [], keyTerms: [] };
    }
  }

  async generateFlashcards(content, count = 10) {
    const prompt = `Generate ${count} flashcard pairs from the following content. Each card should have a front (question) and back (answer). Return as JSON array: [{front: string, back: string, difficulty: 'easy'|'medium'|'hard'}]

Content:
${content}

Return ONLY valid JSON array, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse flashcards:', e);
      return [];
    }
  }

  async generateQuizQuestions(content, count = 5, difficulty = 'medium') {
    const prompt = `Generate ${count} quiz questions from the following content at ${difficulty} difficulty level. Mix question types: multiple-choice, short-answer, and true/false. Return as JSON array: [{type: 'mcq'|'short-answer'|'true-false', question: string, options?: [string], answer: string, explanation: string}]

Content:
${content}

Return ONLY valid JSON array, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse quiz questions:', e);
      return [];
    }
  }

  async explainConcept(concept, context = '') {
    const prompt = `Provide a clear, beginner-friendly explanation of the concept "${concept}".${context ? ` Context: ${context}` : ''} Keep explanation concise (2-3 sentences) with real-world examples.`;
    return this.generateContent(prompt);
  }

  async generateConceptRelationships(concepts) {
    const prompt = `Given these concepts: ${concepts.join(', ')}, identify relationships between them and structure them as a knowledge graph. Return JSON: { nodes: [{id, label, description}], edges: [{source, target, relationship}] }

Return ONLY valid JSON, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse relationships:', e);
      return { nodes: [], edges: [] };
    }
  }

  async expandConceptNode(nodeId, parentConcept, currentDepth = 0, maxDepth = 3) {
    if (currentDepth >= maxDepth) return { subNodes: [], edges: [] };

    const prompt = `For the concept "${parentConcept}", generate 3-5 direct sub-concepts or related topics that break it down further. Return JSON: { subConcepts: [{id: string, name: string, description: string, type: 'subtopic'|'related'|'application'}] }

Return ONLY valid JSON, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to expand concept:', e);
      return { subConcepts: [] };
    }
  }

  async tutorChat(userMessage, documentContext = '') {
    const prompt = `You are an AI study tutor helping students understand concepts. ${documentContext ? `Context from document: ${documentContext}` : ''}

Student: ${userMessage}

Provide a helpful, educational response that clarifies the concept and encourages deeper thinking.`;
    
    return this.generateContent(prompt);
  }

  async extractReviewQuestions(content) {
    const prompt = `Generate 5-8 review questions from the following content that test deep understanding. Return JSON: { questions: [{question: string, expectedAnswer: string, learningObjective: string}] }

Content:
${content}

Return ONLY valid JSON, no additional text.`;
    
    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error('Failed to extract review questions:', e);
      return { questions: [] };
    }
  }
}

export default new GeminiService();