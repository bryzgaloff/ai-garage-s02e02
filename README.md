# AdCreative Generator

An AI-powered tool that generates advertising creatives using the Jobs To Be Done (JTBD) methodology.

## JTBD Methodology

This application implements the Jobs To Be Done framework to analyze product ideas and generate targeted advertising content.

### Pipeline

The JTBD pipeline follows a structured approach:

1. **Product Idea** → Input description of the product and target audience
2. **Jobs** → Identify functional, emotional, and social jobs customers are trying to accomplish
3. **Pains** → Discover functional, emotional, and social pain points and frustrations
4. **Benefits** → Determine key advantages and value propositions that address the pains
5. **Use Cases** → Define specific scenarios where customers would use the product
6. **Creatives** → Generate advertising headlines, descriptions, and calls-to-action

### Purpose as Validation Taxonomy

JTBD serves as a validation framework by:
- Focusing on customer jobs rather than product features
- Providing a systematic way to validate product-market fit
- Ensuring marketing messages resonate with actual customer needs
- Reducing the risk of building solutions to non-existent problems

### Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Components**: Shadcn UI with Tailwind CSS
- **AI Integration**: kilo.ai endpoint for LLM-powered analysis
- **Authentication**: Clerk for user management
- **Analytics**: Plausible for usage tracking
- **Database**: Neon DB (planned for data persistence)

### Getting Started

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start generating creatives.

### Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/ui/` - Shadcn UI components
- `src/lib/` - Utility functions and AI integration
- `src/app/api/` - API endpoints for JTBD generation steps

## Learn More

- [Jobs To Be Done Theory](https://jtbd.info/) - Official JTBD methodology
- [Next.js Documentation](https://nextjs.org/docs) - Framework documentation
- [Shadcn UI](https://ui.shadcn.com/) - Component library
