# 🇰🇪 AI Lesson Planner - Junior Secondary Curriculum Browser

**The Most Comprehensive Kenya CBC Junior Secondary Curriculum System**

An intelligent lesson planning system with **complete embedded Kenya CBC curriculum** for Grades 7-9. Features real-time curriculum browsing, curriculum-aware AI lesson generation, and professional school configuration.

## 🏆 **Unique Features**

- ✅ **Complete Kenya CBC Junior Secondary Curriculum** (Grades 7-9)
- ✅ **16 Subjects Fully Integrated** with official KICD curriculum data
- ✅ **48 Curriculum Files Processed** through automated extraction
- ✅ **Real-time Curriculum Browser** with search functionality
- ✅ **Curriculum-aware AI Lesson Generation** using Qwen AI
- ✅ **Dynamic School Configuration** for different school types
- ✅ **Professional Educator Interface** designed for HODs and teachers

## 🎯 **Competitive Advantages**

- **ONLY system** with complete embedded CBC curriculum
- **Official KICD curriculum data** (not templates or approximations)
- **100% CBC compliance** guaranteed for all lesson plans
- **Professional hosting** with global accessibility
- **Scalable architecture** ready for expansion to all CBC levels

## 📚 **Curriculum Coverage**

### **Core CBC Subjects (100% Complete):**
1. **Mathematics** - 5 strands, 18+ sub-strands
2. **English** - Complete curriculum structure
3. **Kiswahili** - Full language curriculum
4. **Integrated Science** - Comprehensive science curriculum
5. **Pre-technical Studies** - Technology and engineering
6. **Social Studies** - History, geography, civics
7. **Agriculture and Nutrition** - Practical agriculture
8. **Creative Arts & Sports** - Arts and physical education

### **Religious Education:**
9. **Christian Religious Education**
10. **Islamic Religious Education**
11. **Hindu Religious Education**

### **Additional Languages:**
12. **Arabic**
13. **French**
14. **German**
15. **Mandarin**
16. **Indigenous Languages**

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone https://github.com/kefink/AIlessonplanner.git
cd AIlessonplanner

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Qwen API key to .env.local

# Start development server
npm run dev
```

### **Production Deployment**
```bash
# Build for production
npm run build

# Deploy to Vercel
npm run deploy:vercel
```

## 🏗️ **Architecture**

### **Curriculum System**
- **PDF Extraction Pipeline** - Automated curriculum extraction from KICD PDFs
- **Embedded Database** - 93KB TypeScript curriculum database
- **Real-time Browser** - Professional curriculum exploration interface
- **Search Engine** - Cross-curriculum content search

### **AI Integration**
- **Qwen AI Service** - Advanced lesson plan generation
- **Curriculum-aware Prompts** - Context-aware AI responses
- **Professional Templates** - Educator-focused output formats

### **School Configuration**
- **Dynamic Subject Selection** - Based on school type and curriculum
- **HOD Management** - Subject heads of department access control
- **Multi-curriculum Support** - CBC, IGCSE, IB, American, British

## 📁 **Project Structure**

```
AIlessonplanner/
├── components/                 # React components
│   ├── CurriculumBrowser.tsx  # Main curriculum browser
│   ├── SchoolSetup.tsx        # School configuration
│   └── HODDashboard.tsx       # HOD interface
├── services/                   # Core services
│   ├── curriculumDatabase.ts  # Curriculum service
│   ├── embeddedCurriculumDatabase.ts # Extracted curriculum
│   └── qwenAiService.ts       # AI integration
├── data/                      # Curriculum data
│   └── extracted-curriculum/  # 48 processed curriculum files
├── JUNIOR SECONDARY/          # Original KICD PDFs
│   ├── GRADE 7/              # Grade 7 curriculum PDFs
│   ├── GRADE 8/              # Grade 8 curriculum PDFs
│   └── GRADE 9/              # Grade 9 curriculum PDFs
└── scripts/                   # Automation scripts
    ├── extractRemainingSubjects.cjs
    ├── generateCurriculumDatabase.cjs
    └── deployToVercel.cjs
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# .env.local
QWEN_API_KEY=your_qwen_api_key_here
REACT_APP_VERSION=1.0.0-junior-secondary
REACT_APP_CURRICULUM_LEVEL=junior-school
REACT_APP_CURRICULUM_SOURCE=embedded
```

### **Vercel Deployment**
```json
{
  "name": "ai-lesson-planner-junior-secondary",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ]
}
```

## 🎓 **For Educators**

### **School Types Supported**
- **Secondary Schools** - Complete Junior Secondary curriculum
- **Mixed Schools** - Junior Secondary portion fully supported
- **International Schools** - Multiple curriculum options

### **Professional Features**
- **Curriculum Browser** - Explore complete CBC curriculum
- **Lesson Generation** - AI-powered, curriculum-aligned lesson plans
- **School Configuration** - Customize for your institution
- **HOD Dashboard** - Subject head management interface

## 🌐 **Live Demo**

Visit the live application: [Coming Soon - Vercel URL]

## 📈 **Business Impact**

### **For Schools**
- **100% CBC Compliance** - All lesson plans aligned with official curriculum
- **Time Savings** - No manual curriculum research needed
- **Professional Credibility** - Demonstrates curriculum expertise
- **Quality Assurance** - Consistent, high-quality lesson plans

### **For Educators**
- **Curriculum Mastery** - Deep understanding of CBC structure
- **Efficient Planning** - AI-assisted lesson creation
- **Resource Access** - Complete curriculum database at fingertips
- **Professional Development** - Enhanced teaching capabilities

## 🔮 **Roadmap**

### **Phase 1: Junior Secondary (✅ Complete)**
- Complete Grades 7-9 curriculum extraction
- Real-time curriculum browser
- Professional deployment

### **Phase 2: Primary Levels (Planned)**
- Upper Primary (Grades 4-6)
- Lower Primary (Grades 1-3)
- Pre-Primary (PP1-PP2)

### **Phase 3: Complete CBC System**
- Seamless progression PP1 → Grade 9
- Cross-level curriculum connections
- Complete market dominance

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 **License**

This project is proprietary software for educational institutions.

## 🙏 **Acknowledgments**

- **Kenya Institute of Curriculum Development (KICD)** - Official curriculum source
- **Qwen AI** - Advanced language model integration
- **Vercel** - Professional hosting platform

---

**Built with ❤️ for Kenya's educators and students** 🇰🇪
