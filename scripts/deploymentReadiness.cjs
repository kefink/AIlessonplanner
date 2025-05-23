/**
 * Deployment Readiness Check
 * Comprehensive verification before production deployment
 */

const fs = require('fs');
const path = require('path');

function checkDeploymentReadiness() {
  console.log('🚀 DEPLOYMENT READINESS CHECK\n');
  console.log('🇰🇪 Junior Secondary Curriculum Browser - Production Deployment\n');

  const checks = [];
  let allPassed = true;

  // Check 1: Core Files
  console.log('📋 Check 1: Core System Files...');
  const coreFiles = [
    'services/curriculumDatabase.ts',
    'services/embeddedCurriculumDatabase.ts',
    'components/CurriculumBrowser.tsx',
    'components/SchoolSetup.tsx',
  ];

  coreFiles.forEach(file => {
    const exists = fs.existsSync(file);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${file}`);
    checks.push({ check: `Core file: ${file}`, passed: exists });
    if (!exists) allPassed = false;
  });

  // Check 2: Curriculum Data
  console.log('\n📋 Check 2: Curriculum Data Integrity...');
  const extractedDir = 'data/extracted-curriculum';

  if (fs.existsSync(extractedDir)) {
    const files = fs.readdirSync(extractedDir).filter(f => f.endsWith('.json'));
    console.log(`   ✅ Curriculum files: ${files.length}`);

    // Verify core subjects
    const coreSubjects = [
      'mathematics',
      'english',
      'kiswahili',
      'integrated-science',
      'pre-technical-studies',
      'social-studies',
      'agriculture-nutrition',
      'creative-arts-sports',
    ];

    let coreComplete = true;
    coreSubjects.forEach(subject => {
      const subjectFiles = files.filter(f => f.startsWith(subject));
      const hasAllGrades = subjectFiles.length === 3;
      const status = hasAllGrades ? '✅' : '❌';
      console.log(`   ${status} ${subject}: ${subjectFiles.length}/3 grades`);
      if (!hasAllGrades) coreComplete = false;
    });

    checks.push({ check: 'Core subjects complete', passed: coreComplete });
    if (!coreComplete) allPassed = false;
  } else {
    console.log('   ❌ Curriculum data directory missing');
    checks.push({ check: 'Curriculum data', passed: false });
    allPassed = false;
  }

  // Check 3: Embedded Database
  console.log('\n📋 Check 3: Embedded Database...');
  const embeddedFile = 'services/embeddedCurriculumDatabase.ts';

  if (fs.existsSync(embeddedFile)) {
    const content = fs.readFileSync(embeddedFile, 'utf8');
    const size = fs.statSync(embeddedFile).size;

    console.log(`   ✅ Database file size: ${Math.round(size / 1024)}KB`);

    const hasData = content.includes('EMBEDDED_CBC_CURRICULUM');
    const hasFunctions = content.includes('getCurriculumForSubject');
    const hasSearch = content.includes('searchCurriculum');

    console.log(`   ${hasData ? '✅' : '❌'} Curriculum data present`);
    console.log(`   ${hasFunctions ? '✅' : '❌'} Helper functions present`);
    console.log(`   ${hasSearch ? '✅' : '❌'} Search functionality present`);

    const dbReady = hasData && hasFunctions && hasSearch;
    checks.push({ check: 'Embedded database', passed: dbReady });
    if (!dbReady) allPassed = false;
  } else {
    console.log('   ❌ Embedded database file missing');
    checks.push({ check: 'Embedded database', passed: false });
    allPassed = false;
  }

  // Check 4: Component Integration
  console.log('\n📋 Check 4: Component Integration...');
  const browserFile = 'components/CurriculumBrowser.tsx';

  if (fs.existsSync(browserFile)) {
    const content = fs.readFileSync(browserFile, 'utf8');

    const hasService = content.includes('CurriculumService');
    const hasSearch = content.includes('searchQuery');
    const hasSelection = content.includes('onSelectCurriculum');

    console.log(`   ${hasService ? '✅' : '❌'} CurriculumService integration`);
    console.log(`   ${hasSearch ? '✅' : '❌'} Search functionality`);
    console.log(`   ${hasSelection ? '✅' : '❌'} Curriculum selection`);

    const componentReady = hasService && hasSearch && hasSelection;
    checks.push({ check: 'Component integration', passed: componentReady });
    if (!componentReady) allPassed = false;
  } else {
    console.log('   ❌ CurriculumBrowser component missing');
    checks.push({ check: 'Component integration', passed: false });
    allPassed = false;
  }

  // Check 5: School Configuration
  console.log('\n📋 Check 5: School Configuration Updates...');
  const configFile = 'components/SchoolSetup.tsx';

  if (fs.existsSync(configFile)) {
    const content = fs.readFileSync(configFile, 'utf8');

    const hasDynamicSubjects =
      content.includes('getSubjectsForLevel') || content.includes('junior-school');
    const hasEmbeddedData =
      content.includes('EMBEDDED_CBC_CURRICULUM') || content.includes('CurriculumService');

    console.log(`   ${hasDynamicSubjects ? '✅' : '❌'} Dynamic subject selection`);
    console.log(`   ${hasEmbeddedData ? '✅' : '❌'} Embedded curriculum integration`);

    const configReady = hasDynamicSubjects;
    checks.push({ check: 'School configuration', passed: configReady });
    if (!configReady) allPassed = false;
  } else {
    console.log('   ❌ SchoolSetup component missing');
    checks.push({ check: 'School configuration', passed: false });
    allPassed = false;
  }

  // Check 6: Package Dependencies
  console.log('\n📋 Check 6: Dependencies...');
  const packageFile = 'package.json';

  if (fs.existsSync(packageFile)) {
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const deps = { ...packageData.dependencies, ...packageData.devDependencies };

    const requiredDeps = ['react', 'typescript', 'pdf-parse'];
    let depsReady = true;

    requiredDeps.forEach(dep => {
      const hasDepPattern = Object.keys(deps).some(key => key.includes(dep.split('-')[0]));
      const status = hasDepPattern ? '✅' : '❌';
      console.log(`   ${status} ${dep}`);
      if (!hasDepPattern) depsReady = false;
    });

    checks.push({ check: 'Dependencies', passed: depsReady });
    if (!depsReady) allPassed = false;
  } else {
    console.log('   ❌ package.json missing');
    checks.push({ check: 'Dependencies', passed: false });
    allPassed = false;
  }

  // Summary
  console.log('\n🎯 DEPLOYMENT READINESS SUMMARY');
  console.log('================================');

  const passedChecks = checks.filter(c => c.passed).length;
  const totalChecks = checks.length;

  console.log(`Checks passed: ${passedChecks}/${totalChecks}`);
  console.log(`Overall status: ${allPassed ? '✅ READY' : '❌ NEEDS ATTENTION'}`);

  if (allPassed) {
    console.log('\n🚀 READY FOR DEPLOYMENT!');
    console.log('✅ All systems verified');
    console.log('✅ Curriculum data complete');
    console.log('✅ Components integrated');
    console.log('✅ Dependencies satisfied');

    console.log('\n📋 DEPLOYMENT STEPS:');
    console.log('1. Build production bundle');
    console.log('2. Deploy to hosting platform');
    console.log('3. Configure environment variables');
    console.log('4. Test production deployment');
    console.log('5. Update school configuration');
    console.log('6. Launch curriculum browser');
  } else {
    console.log('\n⚠️  DEPLOYMENT BLOCKED');
    console.log('❌ Some checks failed');
    console.log('\nFailed checks:');
    checks
      .filter(c => !c.passed)
      .forEach(check => {
        console.log(`   • ${check.check}`);
      });
  }

  return {
    ready: allPassed,
    checks,
    passedChecks,
    totalChecks,
  };
}

if (require.main === module) {
  checkDeploymentReadiness();
}

module.exports = { checkDeploymentReadiness };
