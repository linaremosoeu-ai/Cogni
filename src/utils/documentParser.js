import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

class DocumentParser {
  async parsePDF(filePath) {
    try {
      const pdf = await pdfjsLib.getDocument(filePath).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
      }
      
      return text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  async parseDOCX(filePath) {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  async parseTXT(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('TXT parsing error:', error);
      throw new Error(`Failed to parse TXT: ${error.message}`);
    }
  }

  async parseMarkdown(filePath) {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('Markdown parsing error:', error);
      throw new Error(`Failed to parse Markdown: ${error.message}`);
    }
  }

  async parseImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return `Image: ${metadata.width}x${metadata.height}, Format: ${metadata.format}, Detected as visual content for concept extraction.`;
    } catch (error) {
      console.error('Image parsing error:', error);
      throw new Error(`Failed to parse image: ${error.message}`);
    }
  }

  async parseDocument(filePath, mimeType) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return this.parsePDF(filePath);
      case '.docx':
        return this.parseDOCX(filePath);
      case '.txt':
        return this.parseTXT(filePath);
      case '.md':
        return this.parseMarkdown(filePath);
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.webp':
        return this.parseImage(filePath);
      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  }

  extractSummary(text, maxLength = 300) {
    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  extractKeyPhrases(text) {
    const words = text.toLowerCase()
      .match(/\b\w{4,}\b/g) || [];
    
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, freq]) => ({ word, frequency: freq }));
  }

  chunkText(text, chunkSize = 2000, overlap = 200) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }
}

export default new DocumentParser();