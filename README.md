# AI Lesson Planner - Automated Development Environment (Qwen AI Powered)

A comprehensive AI-powered lesson planning tool using Qwen AI with full automation support for development, testing, deployment, and data management.

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and npm

### Automated Setup
```bash
# Clone and setup everything automatically
npm run automate setup
```

### Manual Setup
1. Install dependencies: `npm install`
2. Set the `QWEN_API_KEY` in `.env.local` to your Qwen API key
3. Run the app: `npm run dev`

## 🤖 Automation Features

This project includes comprehensive automation for all development tasks:

### Master Automation Command
```bash
npm run automate <workflow>
```

Available workflows:
- `setup` - Initialize project with all configurations
- `quality` - Run code quality checks and fixes
- `build` - Complete build and test cycle
- `data` - Import curriculum data and generate lesson plans
- `deploy` - Deploy application to production
- `dev` - Start development environment
- `ci` - Run full CI pipeline locally
- `maintenance` - Run maintenance and cleanup tasks

### Individual Automation Scripts

#### Development Quality
```bash
npm run lint          # Check code quality
npm run lint:fix      # Fix code quality issues
npm run format        # Format code with Prettier
npm run type-check    # TypeScript type checking
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
```

#### Data Management
```bash
npm run import:curriculum  # Import curriculum data from JSON/CSV
npm run generate:batch     # Generate multiple lesson plans
npm run export:data        # Export generated data in multiple formats
```

#### Build and Deployment
```bash
npm run build         # Build for production
npm run deploy        # Deploy to Vercel
npm run clean         # Clean build artifacts
npm run reinstall     # Clean reinstall dependencies
```

## 📁 Project Structure

```
AI LESSON PLANNER/
├── components/           # React components
├── services/            # Business logic and API services
│   ├── aiPlannerService.ts    # AI lesson plan generation
│   └── curriculumService.ts   # Curriculum data management
├── scripts/             # Automation scripts
│   ├── setup.js         # Project initialization
│   ├── batchGenerate.js # Batch lesson plan generation
│   ├── exportData.js    # Data export utilities
│   ├── importCurriculum.js # Curriculum import utilities
│   └── automate.js      # Master automation script
├── tests/               # Automated tests
├── data/                # Data storage
│   ├── curriculum/      # Curriculum data files
│   └── exports/         # Generated exports
├── logs/                # Application logs
└── automation.config.json # Automation configuration
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```bash
QWEN_API_KEY=your_qwen_api_key_here
QWEN_MODEL=qwen-turbo
QWEN_API_BASE_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation
NODE_ENV=development
LOG_LEVEL=info
```

### Automation Configuration
Edit `automation.config.json` to customize:
- Workflow settings
- Batch generation parameters
- Export formats
- Testing thresholds
- Deployment settings

## 📚 Data Management

### Curriculum Import
Place curriculum files in `data/curriculum/` directory:

**JSON Format:**
```json
{
  "curriculum": [
    {
      "grade": "Grade 9",
      "subject": "Pre-Technical Studies",
      "strand": "FOUNDATIONS OF PRE-TECHNICAL STUDIES",
      "subStrand": "Safety on Raised Platforms",
      "specificLearningOutcomes": ["Outcome 1", "Outcome 2"],
      "keyInquiryQuestions": ["Question 1"],
      "learningExperiences": ["Experience 1"],
      "learningResources": ["Resource 1"],
      "assessmentMethods": ["Method 1"]
    }
  ]
}
```

**CSV Format:**
```csv
grade,subject,strand,subStrand,specificLearningOutcomes,keyInquiryQuestions
"Grade 9","Pre-Technical Studies","FOUNDATIONS","Safety","Outcome 1; Outcome 2","Question 1"
```

### Batch Generation
Generate multiple lesson plans automatically:
```bash
npm run generate:batch
```

### Data Export
Export generated data in multiple formats:
```bash
npm run export:data          # All formats
npm run export:data -- --format csv  # Specific format
```

## 🧪 Testing

### Automated Testing
```bash
npm run test              # Run all tests
npm run test:ui           # Run tests with UI
npm run test:coverage     # Generate coverage report
```

### Test Structure
- Unit tests for services and utilities
- Component tests for React components
- Integration tests for workflows
- Automated CI/CD pipeline

## 🚀 Deployment

### Automated Deployment
```bash
npm run automate deploy   # Full deployment workflow
npm run deploy           # Direct deployment
```

### CI/CD Pipeline
- Automated testing on push
- Code quality checks
- Security scanning
- Automated deployment to Vercel

## 🔍 Monitoring and Maintenance

### Health Checks
```bash
npm run automate maintenance  # Run maintenance tasks
npm audit                    # Security audit
npm outdated                 # Check for updates
```

### Logging
- Application logs in `logs/` directory
- Automated log rotation
- Error tracking and reporting

## 🤝 Contributing

1. Run setup: `npm run automate setup`
2. Make changes
3. Run quality checks: `npm run automate quality`
4. Run tests: `npm run test`
5. Submit pull request

## 📄 License

This project is for demonstration purposes.
