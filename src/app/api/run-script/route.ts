import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST() {
  try {
    console.log('Executing script: node scripts/subidaDatos.js');
    const { stdout, stderr } = await execPromise('node scripts/subidaDatos.js');

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      // Don't treat all stderr as a hard error, as some tools log to it
      // but still exit cleanly. We'll return it but with a 200 OK status.
      return NextResponse.json({ success: true, message: `Stderr:\n${stderr}\n\nStdout:\n${stdout}` });
    }

    console.log(`stdout: ${stdout}`);
    return NextResponse.json({ success: true, message: stdout });

  } catch (error: any) {
    console.error(`exec error: ${error}`);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
