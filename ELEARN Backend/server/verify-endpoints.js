
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  const timestamp = Date.now();
  const teacherEmail = `teacher${timestamp}@gmail.com`;
  const studentEmail = `student_${timestamp}@test.com`;
  const password = 'Password123!';

  console.log('🚀 Starting Backend Verification...\n');

  // 1. Register Teacher
  console.log(`🔹 Registering Teacher (${teacherEmail})...`);
  let res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: teacherEmail,
      password,
      fullName: 'Test Teacher',
      role: 'teacher'
    })
  });
  let data = await res.json();
  if (!res.ok) console.error('❌ Teacher Register Failed:', data);
  else console.log('✅ Teacher Registered:', data.message);

  // 2. Login Teacher
  console.log(`\n🔹 Logging in Teacher...`);
  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: teacherEmail, password })
  });
  data = await res.json();
  let teacherId;
  if (!res.ok) {
    console.error('❌ Teacher Login Failed:', data);
    return; // Cannot proceed without creating course
  } else {
    teacherId = data.user.id;
    console.log('✅ Teacher Logged In. ID:', teacherId);
    console.log('   Role:', data.user.user_metadata?.role);
  }

  // 3. Create Course
  console.log(`\n🔹 Creating Course as Teacher...`);
  res = await fetch(`${BASE_URL}/courses/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `Math 101 (${timestamp})`,
      description: 'Intro to Algebra',
      instructor_id: teacherId // This assumes direct ID mapping
    })
  });
  data = await res.json();
  if (!res.ok) console.error('❌ Create Course Failed:', data);
  else console.log('✅ Course Created:', data.title);

  // 4. Register Student
  console.log(`\n🔹 Registering Student (${studentEmail})...`);
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password,
      fullName: 'Test Student',
      role: 'student'
    })
  });
  data = await res.json();
  if (!res.ok) console.error('❌ Student Register Failed:', data);
  else console.log('✅ Student Registered:', data.message);

  // 5. Get All Courses
  console.log(`\n🔹 Fetching All Courses...`);
  res = await fetch(`${BASE_URL}/courses`);
  data = await res.json();
  if (!res.ok) console.error('❌ Get Courses Failed:', data);
  else {
    console.log('✅ Courses Fetched:', data.length, 'courses found.');
    if (data.length > 0) {
      console.log('   Latest:', data[data.length - 1].title);
    }
  }

  console.log('\n🏁 Verification Complete.');
}

runTests().catch(err => console.error('Unexpected Error:', err));
