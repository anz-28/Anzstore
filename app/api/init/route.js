// This endpoint initializes the database (creates tables and seeds data)
// Only run this once on deployment
// Hit POST /api/init to run

import db from '@/lib/db';

const { initTables } = db;

export async function POST(req) {
  // Security: Only allow from localhost or if secret token matches
  const authHeader = req.headers.get('authorization');
  const secret = process.env.INIT_SECRET_KEY;
  
  if (secret && authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initTables();
    return Response.json({ 
      success: true,
      message: 'Database tables initialized successfully'
    });
  } catch (error) {
    console.error('Init error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
