const router = require('express').Router();
const auth = require('../middleware/auth');
const db = require('../db');

// POST /api/seed  — admin only, run once to populate demo data
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    // Check if already seeded
    const existing = await db.query('SELECT id FROM children LIMIT 1');
    if (existing.rows.length) return res.json({ message: 'Already seeded', count: existing.rows.length });

    // Get classroom IDs
    const classrooms = await db.query('SELECT id, name FROM classrooms');
    const roomMap = {};
    classrooms.rows.forEach(r => { roomMap[r.name.toLowerCase()] = r.id; });

    // Get demo profiles
    const profiles = await db.query(
      "SELECT id, email FROM profiles WHERE email IN ('parent@demo.com','teacher@demo.com','admin@demo.com')"
    );
    const profileMap = {};
    profiles.rows.forEach(p => { profileMap[p.email] = p.id; });

    const parentId  = profileMap['parent@demo.com'];
    const teacherId = profileMap['teacher@demo.com'];
    const adminId   = profileMap['admin@demo.com'];

    // ─── Children ─────────────────────────────────────────────────────────────
    const childRows = [
      { first_name:'Emma',   last_name:'Johnson',  age:3, classroom:'sunflower', parent_id:parentId,  teacher_id:teacherId, emoji:'👧', color_index:0, allergies:['Peanuts'], allergy_alert:true,  medical_notes:'Carries EpiPen. Peanut allergy — severe.',   emergency_contact:'Tom Johnson (Father)',   emergency_phone:'+1 (555) 010-1002', status:'checked_in',  mood:'Happy',   mood_emoji:'😄', teacher_note:'Emma had a wonderful day! She loved the finger painting.', photo_count:6, unread_messages:2 },
      { first_name:'Liam',   last_name:'Smith',    age:4, classroom:'daisy',     parent_id:null,      teacher_id:null,      emoji:'👦', color_index:1, allergies:[],           allergy_alert:false, medical_notes:'',                                           emergency_contact:'Julie Smith (Mother)',   emergency_phone:'+1 (555) 020-2002', status:'checked_in',  mood:'Excited', mood_emoji:'🤩', teacher_note:'Liam was very enthusiastic during science class today.',    photo_count:4, unread_messages:0 },
      { first_name:'Sofia',  last_name:'Garcia',   age:2, classroom:'sunflower', parent_id:null,      teacher_id:teacherId, emoji:'👧', color_index:2, allergies:['Dairy'],    allergy_alert:true,  medical_notes:'Lactose intolerant. Use dairy-free alternatives.', emergency_contact:'Carlos Garcia (Father)', emergency_phone:'+1 (555) 030-3002', status:'absent',      mood:'N/A',     mood_emoji:'😶', teacher_note:'',                                                           photo_count:0, unread_messages:1 },
      { first_name:'Noah',   last_name:'Williams', age:5, classroom:'rainbow',   parent_id:null,      teacher_id:null,      emoji:'👦', color_index:3, allergies:[],           allergy_alert:false, medical_notes:'',                                           emergency_contact:'Anna Williams (Mother)', emergency_phone:'+1 (555) 040-4002', status:'checked_in',  mood:'Playful', mood_emoji:'😊', teacher_note:'Noah showed great leadership during group activities.',       photo_count:8, unread_messages:0 },
      { first_name:'Mia',    last_name:'Brown',    age:3, classroom:'daisy',     parent_id:null,      teacher_id:null,      emoji:'👧', color_index:4, allergies:['Gluten'],   allergy_alert:true,  medical_notes:'Mild gluten sensitivity.',                   emergency_contact:'Tom Brown (Father)',     emergency_phone:'+1 (555) 050-5002', status:'checked_out', mood:'Tired',   mood_emoji:'😴', teacher_note:'Mia was a bit tired today but still participated well.',    photo_count:5, unread_messages:0 },
      { first_name:'Oliver', last_name:'Davis',    age:4, classroom:'rainbow',   parent_id:null,      teacher_id:null,      emoji:'👦', color_index:5, allergies:[],           allergy_alert:false, medical_notes:'',                                           emergency_contact:'Susan Davis (Mother)',   emergency_phone:'+1 (555) 060-6002', status:'checked_in',  mood:'Happy',   mood_emoji:'😄', teacher_note:'Oliver was absolutely delightful today.',                     photo_count:7, unread_messages:3 },
    ];

    const insertedChildren = [];
    for (const c of childRows) {
      const r = await db.query(
        `INSERT INTO children
           (first_name,last_name,age,classroom_id,parent_id,teacher_id,emoji,color_index,
            allergies,allergy_alert,medical_notes,emergency_contact,emergency_phone,
            status,mood,mood_emoji,teacher_note,photo_count,unread_messages)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         RETURNING id`,
        [
          c.first_name, c.last_name, c.age,
          roomMap[c.classroom] || null,
          c.parent_id || null, c.teacher_id || null,
          c.emoji, c.color_index,
          c.allergies, c.allergy_alert, c.medical_notes,
          c.emergency_contact, c.emergency_phone,
          c.status, c.mood, c.mood_emoji, c.teacher_note,
          c.photo_count, c.unread_messages,
        ]
      );
      insertedChildren.push({ name: `${c.first_name} ${c.last_name}`, id: r.rows[0].id });
    }

    // ─── Staff ─────────────────────────────────────────────────────────────────
    const staffRows = [
      { name:'Ms. Patricia Torres', role:'Lead Teacher',    classroom:'sunflower', profile_id:teacherId, email:'teacher@demo.com',  phone:'+1 (555) 100-1001', emoji:'👩‍🏫', certifications:['CPR','First Aid','Early Childhood Education'] },
      { name:'Ms. Rosa Martinez',   role:'Assistant Teacher', classroom:'sunflower', profile_id:null,      email:'rosa@ministar.com', phone:'+1 (555) 100-1002', emoji:'👩',   certifications:['CPR','First Aid'] },
      { name:'Mr. David Chen',      role:'Lead Teacher',    classroom:'daisy',     profile_id:null,      email:'david@ministar.com',phone:'+1 (555) 100-1003', emoji:'👨‍🏫', certifications:['CPR','First Aid','Early Childhood Education','Montessori Certified'] },
      { name:'Ms. Amy Wilson',      role:'Lead Teacher',    classroom:'rainbow',   profile_id:null,      email:'amy@ministar.com',  phone:'+1 (555) 100-1004', emoji:'👩',   certifications:['CPR','First Aid','Special Education'] },
      { name:'Mr. James Lee',       role:'Assistant Teacher', classroom:'daisy',   profile_id:null,      email:'james@ministar.com',phone:'+1 (555) 100-1005', emoji:'👨',   certifications:['CPR','First Aid'] },
      { name:'Linda Park',          role:'Administrator',   classroom:null,        profile_id:adminId,   email:'admin@demo.com',    phone:'+1 (555) 100-1006', emoji:'👩‍💼', certifications:['CPR','Center Director Credential','Business Administration'] },
    ];

    for (const s of staffRows) {
      await db.query(
        `INSERT INTO staff (name,role,classroom_id,profile_id,email,phone,emoji,certifications,status,children_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9)`,
        [s.name, s.role, s.classroom ? roomMap[s.classroom] || null : null,
         s.profile_id || null, s.email, s.phone, s.emoji, s.certifications,
         s.classroom === 'sunflower' ? 2 : s.classroom === 'daisy' ? 2 : s.classroom === 'rainbow' ? 2 : 0]
      );
    }

    // ─── Messages (for Emma - parent@demo.com) ─────────────────────────────────
    const emmaId = insertedChildren.find(c => c.name === 'Emma Johnson')?.id;
    if (emmaId && parentId && teacherId) {
      const msgs = [
        { sender_id: teacherId, receiver_id: parentId, text: 'Good morning! Emma arrived safely and is having a great day. She loved the morning circle! 🌟' },
        { sender_id: parentId, receiver_id: teacherId, text: "That's wonderful! She was so excited this morning 😊" },
        { sender_id: teacherId, receiver_id: parentId, text: 'Emma had a wonderful day! She loved the finger painting and shared her artwork with all her friends. 🎨' },
        { sender_id: teacherId, receiver_id: parentId, text: 'Reminder: Picture Day is this Friday! Please dress Emma in her favourite outfit. 📸' },
        { sender_id: teacherId, receiver_id: parentId, text: 'Also, please remember to bring sunscreen this week for outdoor play ☀️' },
      ];
      for (const m of msgs) {
        await db.query(
          'INSERT INTO messages (child_id,sender_id,receiver_id,text,read) VALUES ($1,$2,$3,$4,$5)',
          [emmaId, m.sender_id, m.receiver_id, m.text, true]
        );
      }
    }

    // ─── Payments (for Emma) ───────────────────────────────────────────────────
    if (emmaId && parentId) {
      const payments = [
        { amount:1200, description:'Monthly Tuition — June 2025',     status:'upcoming', due_date:'2025-06-01', payment_type:'Tuition' },
        { amount:1200, description:'Monthly Tuition — May 2025',      status:'paid',     due_date:'2025-05-01', payment_type:'Tuition' },
        { amount:1200, description:'Monthly Tuition — April 2025',    status:'paid',     due_date:'2025-04-01', payment_type:'Tuition' },
        { amount:25,   description:'Field Trip — Zoo Visit',           status:'paid',     due_date:'2025-03-15', payment_type:'Activity' },
        { amount:1200, description:'Monthly Tuition — March 2025',    status:'paid',     due_date:'2025-03-01', payment_type:'Tuition' },
      ];
      for (const p of payments) {
        await db.query(
          `INSERT INTO payments (child_id,parent_id,amount,description,payment_type,status,due_date,created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [emmaId, parentId, p.amount, p.description, p.payment_type, p.status, p.due_date, adminId]
        );
      }
    }

    res.json({ message: 'Seeded successfully', children: insertedChildren });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
