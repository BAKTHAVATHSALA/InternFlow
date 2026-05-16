const db = require('./src/db');

const seedJobs = async () => {
  try {
    const jobs = [
      {
        title: 'Software Engineer Intern',
        department: 'Engineering',
        description: 'Work on building modern web applications using React and Node.js.',
        tech_stack: ['React', 'Node.js', 'PostgreSQL'],
        stipend: 25000,
        mode: 'Hybrid',
        location: 'Bangalore'
      },
      {
        title: 'Product Management Intern',
        department: 'Product',
        description: 'Help define product roadmaps and work closely with engineering teams.',
        tech_stack: ['Agile', 'Jira', 'Analytics'],
        stipend: 20000,
        mode: 'Remote',
        location: 'Remote'
      },
      {
        title: 'Data Science Intern',
        department: 'Data',
        description: 'Build predictive models and analyze large datasets.',
        tech_stack: ['Python', 'Pandas', 'Scikit-learn'],
        stipend: 30000,
        mode: 'Onsite',
        location: 'Mumbai'
      }
    ];

    for (const job of jobs) {
      await db.query(
        `INSERT INTO jobs (title, department, description, tech_stack, stipend, mode, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [job.title, job.department, job.description, job.tech_stack, job.stipend, job.mode, job.location]
      );
    }

    console.log('Jobs seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding jobs:', err);
    process.exit(1);
  }
};

seedJobs();
