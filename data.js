/* =========================================================
   VIGNAN STUDENT COMPLAINT PORTAL - EXPANDED MOCK DATABASE
   Data models for Students, Super Admins, Nodal Officers, Working Staff,
   SLA Deadline Timers, Internal Notes, Public Chat & Resolution Proofs
   Vignan's Institute of Information Technology (VIIT)
   ========================================================= */

const MOCK_DATA = {
  // Student Profiles keyed by Vignan Roll Number
  students: {
    "211FA04001": {
      rollNo: "211FA04001",
      name: "Rahul Sharma",
      department: "Computer Science & Engg. (VIIT)",
      year: "3rd Year (Sem VI)",
      email: "rahul.211fa04001@vignan.ac.in",
      phone: "+91 98765 43210",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
    },
    "211FA04002": {
      rollNo: "211FA04002",
      name: "Priya Patel",
      department: "Electrical & Electronics Engg. (VIIT)",
      year: "4th Year (Sem VIII)",
      email: "priya.211fa04002@vignan.ac.in",
      phone: "+91 98765 12345",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    },
    "211FA04003": {
      rollNo: "211FA04003",
      name: "Amit Kumar",
      department: "Mechanical Engineering (VIIT)",
      year: "2nd Year (Sem IV)",
      email: "amit.211fa04003@vignan.ac.in",
      phone: "+91 99887 76655",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit"
    }
  },

  // Admin Profiles (Super Admin & Department Nodal Officers)
  admins: {
    "ADMIN01": {
      id: "ADMIN01",
      name: "Dr. S. R. Varma",
      role: "Super Admin",
      designation: "Dean of Student Affairs - Vignan University",
      email: "dean.grievance@vignan.ac.in",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
    },
    "HOD_IT": {
      id: "HOD_IT",
      name: "Dr. K. V. Raman",
      role: "Nodal Officer",
      department: "Infrastructure & IT",
      designation: "Head of Vignan Campus IT Infrastructure",
      email: "hod.it@vignan.ac.in",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raman"
    },
    "HOD_HOSTEL": {
      id: "HOD_HOSTEL",
      name: "Prof. M. Suresh",
      role: "Nodal Officer",
      department: "Hostel & Mess",
      designation: "Chief Warden - Vignan Hostels",
      email: "chief.warden@vignan.ac.in",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh"
    }
  },

  // WORKING STAFF PROFILES (Ground Staff assigned to specific tasks)
  workingStaff: {
    "STAFF_IT": {
      id: "STAFF_IT",
      name: "Anil Kumar",
      role: "Working Staff",
      department: "Infrastructure & IT",
      specialization: "Network & Optical Fiber Specialist",
      phone: "+91 91234 56789",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil"
    },
    "STAFF_ELEC": {
      id: "STAFF_ELEC",
      name: "Ramesh Babu",
      role: "Working Staff",
      department: "Campus Maintenance",
      specialization: "Senior Campus Electrician",
      phone: "+91 92345 67890",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh"
    },
    "STAFF_HOSTEL": {
      id: "STAFF_HOSTEL",
      name: "Vikas Singh",
      role: "Working Staff",
      department: "Hostel & Mess",
      specialization: "Hostel Block Sanitation & RO Supervisor",
      phone: "+91 93456 78901",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikas"
    }
  },

  // Pre-populated Student Complaints with UGC 20-Day SLA, Internal Notes & Attachments
  complaints: [
    {
      id: "CMP-2026-094",
      rollNo: "211FA04002",
      studentName: "Priya Patel",
      category: "Infrastructure",
      title: "Wi-Fi non-functional in Vignan N-Block 2nd Floor Labs",
      location: "Vignan N-Block, CSE Lab 4",
      subcat: "Network & IT",
      priority: "High",
      status: "In Progress", // Received, Assigned, Under Investigation, Resolved
      stage: 3,
      date: "2026-08-10 10:30 AM",
      submittedDateIso: "2026-08-10T10:30:00",
      targetSlaDays: 20, // UGC 20 working day compliance mandate
      slaDaysRemaining: 17,
      isSlaOverdue: false,
      description: "High latency and continuous disconnections on Vignan campus Wi-Fi network in N-Block 2nd floor during lab hours. Unable to complete programming assignments.",
      upvotes: 14,
      officer: "Dr. K. V. Raman (IT HOD)",
      assignedStaffId: "STAFF_IT", // Assigned specifically to Anil Kumar
      assignedStaffName: "Anil Kumar (IT Specialist)",
      studentAttachment: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
      resolutionProof: null,
      internalNotes: [
        { author: "Dr. K. V. Raman (IT HOD)", time: "Aug 10, 02:15 PM", text: "Assigned ticket to Anil Kumar. Replacement router module requisitioned from vendor." },
        { author: "Anil Kumar (IT Staff)", time: "Aug 11, 09:30 AM", text: "Tested optical line. Main switch port #4 flickers. Installing replacement switch today." }
      ],
      publicMessages: [
        { sender: "Admin Cell", time: "Aug 10, 02:20 PM", text: "Your grievance has been assigned to Vignan senior network technician Anil Kumar." },
        { sender: "Priya Patel", time: "Aug 11, 10:00 AM", text: "Thank you. Lab 3 is also experiencing disconnections." }
      ],
      timeline: [
        { title: "Complaint Registered", time: "Aug 10, 10:30 AM", desc: "Logged securely via Vignan Student Portal." },
        { title: "Under Review by IT Cell", time: "Aug 10, 02:15 PM", desc: "Assigned to Senior Technician Anil Kumar." },
        { title: "Technician Dispatched", time: "Aug 11, 09:00 AM", desc: "Replacement access point & optical fiber module ordered." }
      ]
    },
    {
      id: "CMP-2026-091",
      rollNo: "211FA04001",
      studentName: "Rahul Sharma",
      category: "Hostel & Mess",
      title: "Hygiene & Water Quality issue in Vignan Block-3 Mess Hall",
      location: "Vignan Boys Hostel Block-3 Mess",
      subcat: "Sanitation & Food",
      priority: "High",
      status: "In Progress",
      stage: 3,
      date: "2026-08-09 01:15 PM",
      submittedDateIso: "2026-08-09T13:15:00",
      targetSlaDays: 20,
      slaDaysRemaining: 16,
      isSlaOverdue: false,
      description: "Drinking water filter unit on 1st floor mess hall requires immediate filter cartridge replacement and sanitation audit.",
      upvotes: 28,
      officer: "Prof. M. Suresh (Chief Warden)",
      assignedStaffId: "STAFF_HOSTEL", // Assigned to Vikas Singh
      assignedStaffName: "Vikas Singh (Hostel Supervisor)",
      studentAttachment: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
      resolutionProof: null,
      internalNotes: [
        { author: "Prof. M. Suresh", time: "Aug 09, 05:00 PM", text: "Issued penalty notice to caterer. Ordered Vikas to install new 50L RO unit." }
      ],
      publicMessages: [
        { sender: "Hostel Office", time: "Aug 09, 05:10 PM", text: "Complaint accepted. Temporary mineral water jars provided at mess counter." }
      ],
      timeline: [
        { title: "Grievance Filed", time: "Aug 09, 01:15 PM", desc: "Submitted under Hostel & Mess category." },
        { title: "Warden Inspection", time: "Aug 09, 05:00 PM", desc: "Chief warden visited site and issued notice to mess contractor." },
        { title: "Work Order Issued", time: "Aug 10, 11:30 AM", desc: "Assigned to Vikas Singh for RO unit replacement." }
      ]
    },
    {
      id: "CMP-2026-088",
      rollNo: "211FA04001",
      studentName: "Rahul Sharma",
      category: "Academic",
      title: "Delay in 5th Semester Revaluation Marks Updating",
      location: "Vignan Main Admin Block - Room 102",
      subcat: "Valuation & Transcripts",
      priority: "Medium",
      status: "Under Investigation",
      stage: 3,
      date: "2026-08-05 04:00 PM",
      submittedDateIso: "2026-08-05T16:00:00",
      targetSlaDays: 20,
      slaDaysRemaining: 12,
      isSlaOverdue: false,
      description: "Revaluation result updated status is not reflecting on VIIT online portal for CSE Department Data Structures subject.",
      upvotes: 6,
      officer: "Dr. S. Meenakshi (Controller of Exams)",
      assignedStaffId: "HOD_IT",
      assignedStaffName: "Exam Cell IT Desk",
      studentAttachment: null,
      resolutionProof: null,
      internalNotes: [
        { author: "Exam Officer", time: "Aug 07, 11:00 AM", text: "Physical marks ledger verified (+6 marks). Pending web database sync." }
      ],
      publicMessages: [
        { sender: "Exam Cell", time: "Aug 07, 11:05 AM", text: "Your script was re-checked. Updated ledger entry undergoing verification." }
      ],
      timeline: [
        { title: "Application Received", time: "Aug 05, 04:00 PM", desc: "Forwarded to Vignan Exam Controller Section." },
        { title: "Script Verified", time: "Aug 07, 11:00 AM", desc: "Corrected marks verified by board." }
      ]
    },
    {
      id: "CMP-2026-082",
      rollNo: "211FA04003",
      studentName: "Amit Kumar",
      category: "Infrastructure",
      title: "Projector Bulb Dimming in Mechanical Lecture Hall 104",
      location: "Vignan Mech Block - LH 104",
      subcat: "Classroom Equipment",
      priority: "Medium",
      status: "Resolved",
      stage: 5,
      date: "2026-08-02 09:45 AM",
      submittedDateIso: "2026-08-02T09:45:00",
      targetSlaDays: 20,
      slaDaysRemaining: 9,
      isSlaOverdue: false,
      description: "Ceiling projector bulb flickers continuously during CAD/CAM morning presentation lectures.",
      upvotes: 9,
      officer: "Er. Ramesh Babu (Campus Maintenance HOD)",
      assignedStaffId: "STAFF_ELEC", // Assigned to Ramesh Babu
      assignedStaffName: "Ramesh Babu (Electrician)",
      studentAttachment: null,
      resolutionProof: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      internalNotes: [
        { author: "Ramesh Babu (Staff)", time: "Aug 03, 01:30 PM", text: "Replaced faulty 4000lm Sony projector lamp and calibrated focal lens." }
      ],
      publicMessages: [
        { sender: "Ramesh Babu (Staff)", time: "Aug 03, 02:00 PM", text: "Projector bulb replaced with new unit. Tested with CAD software slides." }
      ],
      timeline: [
        { title: "Logged", time: "Aug 02, 09:45 AM", desc: "Issue assigned to electrician Ramesh Babu." },
        { title: "Replacement Done", time: "Aug 03, 02:00 PM", desc: "New 4K projector lamp installed and verified." }
      ]
    },
    {
      id: "CMP-2026-079",
      rollNo: "211FA04002",
      studentName: "Priya Patel",
      category: "Academic",
      title: "Library Digital Reference Terminal Network Outage",
      location: "VIIT Central Library 1st Floor",
      subcat: "Library Systems",
      priority: "Low",
      status: "Received",
      stage: 1,
      date: "2026-08-11 03:20 PM",
      submittedDateIso: "2026-08-11T15:20:00",
      targetSlaDays: 20,
      slaDaysRemaining: 18,
      isSlaOverdue: false,
      description: "E-journal database terminal 3 & 4 disconnected from IEEE digital library server.",
      upvotes: 4,
      officer: "Mrs. Lalitha (Chief Librarian)",
      assignedStaffId: "STAFF_IT",
      assignedStaffName: "Anil Kumar (IT Specialist)",
      studentAttachment: null,
      resolutionProof: null,
      internalNotes: [],
      publicMessages: [],
      timeline: [
        { title: "Submitted", time: "Aug 11, 03:20 PM", desc: "Pending librarian verification." }
      ]
    },
    {
      id: "CMP-2026-065",
      rollNo: "211FA04003",
      studentName: "Amit Kumar",
      category: "Finance & Fees",
      title: "Scholarship Credit Reconciliation Discrepancy",
      location: "VIIT Accounts Counter 3",
      subcat: "Fee Counter",
      priority: "High",
      status: "Assigned",
      stage: 2,
      date: "2026-07-20 10:00 AM",
      submittedDateIso: "2026-07-20T10:00:00",
      targetSlaDays: 20,
      slaDaysRemaining: -4, // Overdue SLA Breach! (> 20 days)
      isSlaOverdue: true,
      description: "Government post-metric scholarship credit receipt not reflecting in Vignan fee portal ledger despite bank confirmation.",
      upvotes: 11,
      officer: "Accounts Officer",
      assignedStaffId: "ADMIN01",
      assignedStaffName: "Accounts Nodal Cell",
      studentAttachment: null,
      resolutionProof: null,
      internalNotes: [
        { author: "Accounts Staff", time: "Jul 25, 02:00 PM", text: "Awaiting bank statement reconciliation file from treasury." }
      ],
      publicMessages: [
        { sender: "Accounts Desk", time: "Jul 22, 11:30 AM", text: "Grievance forwarded to Treasury Desk for verification." }
      ],
      timeline: [
        { title: "Submitted", time: "Jul 20, 10:00 AM", desc: "Scholarship query registered." },
        { title: "Forwarded to Treasury", time: "Jul 22, 11:30 AM", desc: "Bank ledger verification requested." }
      ]
    }
  ]
};

