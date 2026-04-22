# JTBD AdCreative Generator

A Next.js application that implements Jobs-To-Be-Done (JTBD) methodology for generating marketing creatives. The platform analyzes product ideas through a structured JTBD decomposition pipeline and generates targeted advertising content for Google Ads, Meta Ads, and other marketing channels.

## Pipeline

The application follows a comprehensive JTBD validation pipeline:

**Product Idea → JTBD Decomposition → Marketing Creatives**

1. **Functional Jobs**: Core tasks customers need to accomplish
2. **Emotional Jobs**: Emotional states and feelings customers seek
3. **Social Jobs**: Social recognition and status customers desire
4. **Functional Pains**: Practical problems and obstacles
5. **Emotional Pains**: Emotional frustrations and anxieties
6. **Social Pains**: Social pressures and embarrassments
7. **Benefits**: Key advantages and value propositions
8. **Use Cases**: Specific scenarios where the product is applied
9. **Marketing Creatives**: Headlines, ad descriptions, hero texts, and CTAs

## Purpose

This is a validation pipeline for feature prioritization through market response. JTBD serves as a taxonomy for hypothesis classification, not discovery. The methodology helps prioritize product features by understanding what customers are truly trying to achieve and the pains they're experiencing.

## Technical Details

- **AI Endpoint**: OpenAI-compatible API at `https://api.kilo.ai/api/gateway/`
- **Model**: `kilo-auto/free` with retry logic for rate limit handling
- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **UI Components**: Shadcn UI component library
- **Authentication**: Clerk for user management
- **Database**: Neon PostgreSQL
- **Analytics**: Plausible for privacy-friendly web analytics

The application uses sequential API calls to build JTBD insights incrementally, with each step building upon the previous analysis.

## UI Components

The dashboard presents JTBD components as interactive cards and tags:

- **JTBD Cards**: Organized sections for Jobs, Pains, Benefits, and Use Cases
- **Tag System**: Color-coded tags for functional (blue), emotional (pink), and social (green) dimensions
- **Progressive Disclosure**: Results appear incrementally as analysis completes
- **Creative Gallery**: Generated marketing content displayed in categorized sections

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Enter a product description in the main input field
2. The system analyzes the product through the JTBD pipeline
3. View generated Jobs, Pains, Benefits, and Use Cases
4. Access ready-to-use marketing creatives for various platforms

## Architecture

- **Frontend**: Single-page Next.js application with client-side state management
- **API Routes**: Modular endpoints for each JTBD analysis step (`/api/generate-jtbd-*`)
- **Streaming UI**: Progressive result display as analysis completes
- **Error Handling**: Retry logic and user-friendly error messages</content>
<parameter name="filePath">README.md