const fs = require('fs');
const path = require('path');
const db = require('./src/db');

const initDb = async () => {
  try {
    console.log('Reading schema.txt...');
    const schemaPath = path.resolve(__dirname, '..', 'schema.txt');
    console.log(`Resolved path: ${schemaPath}`);
    let schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(`Schema length: ${schema.length} characters`);
    console.log(`First 100 chars: ${schema.substring(0, 100)}`);

    // Remove comments
    schema = schema.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    console.log('Resetting schema...');
    await db.query('DROP SCHEMA IF EXISTS public CASCADE');
    await db.query('CREATE SCHEMA public');
    await db.query('GRANT ALL ON SCHEMA public TO postgres');
    await db.query('GRANT ALL ON SCHEMA public TO public');

    console.log('Executing schema...');
    
    // Smart split by semicolon but respect $$ blocks
    const statements = [];
    let current = '';
    let inDollarBlock = false;
    
    const lines = schema.split(/\r?\n/);
    console.log(`Processing ${lines.length} lines...`);
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes('$$')) {
        inDollarBlock = !inDollarBlock;
      }
      
      current += ' ' + line;

      if (trimmed.endsWith(';') && !inDollarBlock) {
        statements.push(current.trim());
        current = '';
      }
    }
    if (current.trim()) statements.push(current.trim());

    console.log(`Found ${statements.length} statements.`);

    for (let statement of statements) {
      try {
        await db.query(statement);
      } catch (err) {
        console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
        console.error(`Error message: ${err.message}`);
        // If it's a "function already exists" or similar, we might want to continue
      }
    }
    
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      UPDATE users SET password_hash = '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6' 
      WHERE role IN ('admin', 'hr', 'employee', 'mentor');
    `);
    console.log('Password column added and staff passwords reset.');

    console.log('Seeding departments, jobs, and mentors...');
    const seedSql = `
      -- Jobs
      INSERT INTO jobs (title, department, description, tech_stack, stipend, is_open) VALUES
        ('UI/UX Intern', 'Design', 'Design user interfaces.', ARRAY['Figma', 'Sketch'], 10000, true),
        ('Product Design Intern', 'Design', 'End to end product design.', ARRAY['Figma', 'Prototyping'], 12000, true),
        ('Motion Design Intern', 'Design', 'Create engaging motion graphics.', ARRAY['After Effects', 'Premiere'], 11000, true),
        
        ('Backend Intern', 'Engineering', 'Develop server-side logic.', ARRAY['Node.js', 'PostgreSQL'], 15000, true),
        ('Frontend Intern', 'Engineering', 'Build web interfaces.', ARRAY['React', 'JavaScript'], 14000, true),
        ('Mobile App Intern', 'Engineering', 'Develop mobile applications.', ARRAY['Flutter', 'React Native'], 15000, true),
        
        ('Digital marketing Intern', 'Marketing', 'Execute digital marketing campaigns.', ARRAY['Google Ads', 'Analytics'], 9000, true),
        ('SEO specialist Intern', 'Marketing', 'Improve search engine rankings.', ARRAY['SEO', 'Ahrefs'], 9500, true),
        ('Content writing Intern', 'Marketing', 'Write engaging content.', ARRAY['Copywriting', 'Wordpress'], 8000, true),
        
        ('PM Intern', 'Product', 'Assist in product management.', ARRAY['Jira', 'Agile'], 13000, true),
        ('Product Analyst Intern', 'Product', 'Analyze product usage data.', ARRAY['SQL', 'Mixpanel'], 12500, true),
        ('Stragiest Intern', 'Product', 'Develop product strategies.', ARRAY['Strategy', 'Market Research'], 13000, true),
        
        ('Recruitment Intern', 'HR', 'Assist in sourcing and screening.', ARRAY['LinkedIn Recruiter', 'ATS'], 8500, true),
        ('People Ops Intern', 'HR', 'Help manage employee relations.', ARRAY['HRIS', 'Communication'], 9000, true),
        ('Training Intern', 'HR', 'Assist with training programs.', ARRAY['LMS', 'Instructional Design'], 8500, true),
        
        ('Security Analyst Intern', 'Cybersecurity', 'Monitor and protect systems.', ARRAY['SIEM', 'Network Security'], 14000, true),
        ('Pentenster Intern', 'Cybersecurity', 'Perform penetration testing.', ARRAY['Kali Linux', 'Burp Suite'], 15000, true),
        ('Network Scurity Intern', 'Cybersecurity', 'Secure network infrastructure.', ARRAY['Firewalls', 'VPN'], 14000, true),
        
        ('Data Analyst Intern', 'Data', 'Analyze and visualize data.', ARRAY['Python', 'Tableau'], 13000, true),
        ('Machine Learning Intern', 'Data', 'Build ML models.', ARRAY['Python', 'TensorFlow'], 16000, true),
        ('Data Engineering Intern', 'Data', 'Build data pipelines.', ARRAY['Python', 'Spark'], 15000, true);

      -- Mentors
      INSERT INTO users (email, name, role, status, department, password_hash) VALUES
        ('design.mentor1@hexaware.com', 'Design Mentor 1', 'mentor', 'active', 'Design', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('design.mentor2@hexaware.com', 'Design Mentor 2', 'mentor', 'active', 'Design', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('design.mentor3@hexaware.com', 'Design Mentor 3', 'mentor', 'active', 'Design', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('engineering.mentor1@hexaware.com', 'Engineering Mentor 1', 'mentor', 'active', 'Engineering', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('engineering.mentor2@hexaware.com', 'Engineering Mentor 2', 'mentor', 'active', 'Engineering', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('engineering.mentor3@hexaware.com', 'Engineering Mentor 3', 'mentor', 'active', 'Engineering', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('marketing.mentor1@hexaware.com', 'Marketing Mentor 1', 'mentor', 'active', 'Marketing', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('marketing.mentor2@hexaware.com', 'Marketing Mentor 2', 'mentor', 'active', 'Marketing', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('marketing.mentor3@hexaware.com', 'Marketing Mentor 3', 'mentor', 'active', 'Marketing', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('product.mentor1@hexaware.com', 'Product Mentor 1', 'mentor', 'active', 'Product', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('product.mentor2@hexaware.com', 'Product Mentor 2', 'mentor', 'active', 'Product', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('product.mentor3@hexaware.com', 'Product Mentor 3', 'mentor', 'active', 'Product', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('hr.mentor1@hexaware.com', 'HR Mentor 1', 'mentor', 'active', 'HR', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('hr.mentor2@hexaware.com', 'HR Mentor 2', 'mentor', 'active', 'HR', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('hr.mentor3@hexaware.com', 'HR Mentor 3', 'mentor', 'active', 'HR', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('cybersecurity.mentor1@hexaware.com', 'Cybersecurity Mentor 1', 'mentor', 'active', 'Cybersecurity', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('cybersecurity.mentor2@hexaware.com', 'Cybersecurity Mentor 2', 'mentor', 'active', 'Cybersecurity', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('cybersecurity.mentor3@hexaware.com', 'Cybersecurity Mentor 3', 'mentor', 'active', 'Cybersecurity', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        
        ('data.mentor1@hexaware.com', 'Data Mentor 1', 'mentor', 'active', 'Data', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('data.mentor2@hexaware.com', 'Data Mentor 2', 'mentor', 'active', 'Data', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6'),
        ('data.mentor3@hexaware.com', 'Data Mentor 3', 'mentor', 'active', 'Data', '$2b$10$j6vwb1RaPVIXJOrehOYIFupjV.Hsvqs4TlnidgZ8s86PUn5OJ53G6');
    `;
    await db.query(seedSql);
    console.log('Departments, Jobs, and Mentors seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
