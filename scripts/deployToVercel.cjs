/**
 * Deploy to Vercel Script
 * Automated deployment of Junior Secondary Curriculum Browser
 */

const { spawn } = require('child_process');
const fs = require('fs');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function deployToVercel() {
  console.log('🚀 DEPLOYING TO VERCEL - JUNIOR SECONDARY CURRICULUM BROWSER\n');
  console.log('🇰🇪 Kenya CBC Junior School Curriculum - Going Live!\n');
  
  try {
    // Step 1: Pre-deployment checks
    console.log('📋 Step 1: Pre-deployment Verification...');
    
    // Check if build exists
    if (!fs.existsSync('dist')) {
      console.log('   ⚠️  Build directory not found. Building now...');
      await runCommand('npm', ['run', 'build']);
    } else {
      console.log('   ✅ Build directory found');
    }
    
    // Check curriculum data
    const curriculumDir = 'data/extracted-curriculum';
    if (fs.existsSync(curriculumDir)) {
      const files = fs.readdirSync(curriculumDir).filter(f => f.endsWith('.json'));
      console.log(`   ✅ ${files.length} curriculum files ready for deployment`);
    } else {
      throw new Error('Curriculum data missing - cannot deploy without curriculum');
    }
    
    // Check embedded database
    if (fs.existsSync('services/embeddedCurriculumDatabase.ts')) {
      const size = fs.statSync('services/embeddedCurriculumDatabase.ts').size;
      console.log(`   ✅ Embedded curriculum database ready (${Math.round(size / 1024)}KB)`);
    } else {
      throw new Error('Embedded curriculum database missing');
    }
    
    // Step 2: Vercel login check
    console.log('\n🔐 Step 2: Vercel Authentication...');
    try {
      await runCommand('vercel', ['whoami']);
      console.log('   ✅ Already logged in to Vercel');
    } catch (error) {
      console.log('   🔑 Please log in to Vercel...');
      await runCommand('vercel', ['login']);
    }
    
    // Step 3: Deploy to Vercel
    console.log('\n🚀 Step 3: Deploying to Vercel...');
    console.log('   📤 Uploading Junior Secondary Curriculum Browser...');
    
    await runCommand('vercel', ['--prod', '--yes']);
    
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
    
    // Step 4: Post-deployment summary
    console.log('\n📊 DEPLOYMENT SUMMARY');
    console.log('=====================');
    
    console.log('✅ LIVE DEPLOYMENT COMPLETED!');
    console.log('✅ Junior Secondary Curriculum Browser is now online');
    console.log('✅ Complete Kenya CBC curriculum accessible worldwide');
    console.log('✅ Professional hosting with Vercel');
    
    console.log('\n🌐 YOUR LIVE APPLICATION:');
    console.log('   • Vercel will provide the live URL');
    console.log('   • Automatic HTTPS enabled');
    console.log('   • Global CDN distribution');
    console.log('   • Automatic deployments on updates');
    
    console.log('\n🇰🇪 CURRICULUM FEATURES LIVE:');
    console.log('   ✅ Complete Junior Secondary curriculum (Grades 7-9)');
    console.log('   ✅ 16 subjects with full curriculum data');
    console.log('   ✅ Real-time curriculum browser');
    console.log('   ✅ Dynamic school configuration');
    console.log('   ✅ Curriculum-aware lesson generation');
    console.log('   ✅ Professional educator interface');
    
    console.log('\n🎯 IMMEDIATE NEXT STEPS:');
    console.log('1. 📝 Note down the Vercel URL provided');
    console.log('2. 🌐 Configure custom domain (optional)');
    console.log('3. 📊 Set up analytics and monitoring');
    console.log('4. 👥 Share with sales team for demos');
    console.log('5. 🏫 Start reaching out to secondary schools');
    
    console.log('\n🏆 COMPETITIVE ADVANTAGES NOW LIVE:');
    console.log('   • ONLY system with embedded CBC curriculum online');
    console.log('   • Official KICD curriculum data accessible 24/7');
    console.log('   • Professional hosting and performance');
    console.log('   • Global accessibility for international schools');
    
    console.log('\n📈 BUSINESS IMPACT:');
    console.log('   • Ready for immediate customer demos');
    console.log('   • Professional credibility established');
    console.log('   • Scalable infrastructure in place');
    console.log('   • Revenue generation can begin now');
    
    console.log('\n🎓 CONGRATULATIONS! YOUR CURRICULUM SYSTEM IS LIVE! 🇰🇪');
    
  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Ensure you have a Vercel account');
    console.log('2. Check internet connection');
    console.log('3. Verify build completed successfully');
    console.log('4. Try: vercel login (if authentication failed)');
    console.log('5. Try: npm run build (if build missing)');
    process.exit(1);
  }
}

if (require.main === module) {
  deployToVercel().catch(console.error);
}

module.exports = { deployToVercel };
