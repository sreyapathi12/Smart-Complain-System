/* ============================================
   SEED.JS — Database Seed Script
   Smart Citizen Grievance Management System
   ============================================
   Run with: node seed/seed.js
   Add  --fresh  flag to drop & recreate collections:
   node seed/seed.js --fresh
   ============================================ */

require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/config');

const Citizen   = require('../models/Citizen');
const Officer   = require('../models/Officer');
const Complaint = require('../models/Complaint');
const Notice    = require('../models/Notice');

// =============================================
// SAMPLE DATA
// =============================================

const citizensData = [
  { citizenId: 'CIT001', name: 'Ravi Kumar',       mobile: '9876543210', email: 'ravi@gmail.com',     password: 'citizen123', ward: 'Ward 3',  address: '12-3, MG Road, Ward 3',       aadhaar: 'XXXX-XXXX-3210' },
  { citizenId: 'CIT002', name: 'Lakshmi Devi',     mobile: '9876543211', email: 'lakshmi@gmail.com',  password: 'citizen123', ward: 'Ward 5',  address: '45, Nehru Street, Ward 5',     aadhaar: 'XXXX-XXXX-3211' },
  { citizenId: 'CIT003', name: 'Suresh Babu',      mobile: '9876543212', email: 'suresh@gmail.com',   password: 'citizen123', ward: 'Ward 7',  address: '78, RTC Colony, Ward 7',       aadhaar: 'XXXX-XXXX-3212' },
  { citizenId: 'CIT004', name: 'Padmavathi',       mobile: '9876543213', email: 'padma@gmail.com',    password: 'citizen123', ward: 'Ward 2',  address: 'Old Town, Ward 2',             aadhaar: 'XXXX-XXXX-3213' },
  { citizenId: 'CIT005', name: 'Venkatesh Rao',    mobile: '9876543214', email: 'venkatesh@gmail.com',password: 'citizen123', ward: 'Ward 9',  address: 'New Colony, Ward 9',           aadhaar: 'XXXX-XXXX-3214' },
  { citizenId: 'CIT006', name: 'Anita Sharma',     mobile: '9876543215', email: 'anita@gmail.com',    password: 'citizen123', ward: 'Ward 1',  address: 'Market Area, Ward 1',          aadhaar: 'XXXX-XXXX-3215' },
  { citizenId: 'CIT007', name: 'Mohammed Farooq',  mobile: '9876543216', email: 'farooq@gmail.com',   password: 'citizen123', ward: 'Ward 6',  address: 'Hassan Nagar, Ward 6',         aadhaar: 'XXXX-XXXX-3216' },
  { citizenId: 'CIT008', name: 'Saraswathi',       mobile: '9876543217', email: 'saraswathi@gmail.com',password:'citizen123', ward: 'Ward 4',  address: 'Teachers Colony, Ward 4',      aadhaar: 'XXXX-XXXX-3217' },
  { citizenId: 'CIT009', name: 'Narasimha Reddy',  mobile: '9876543218', email: 'narasimha@gmail.com',password:'citizen123', ward: 'Ward 8',  address: 'Industrial Area, Ward 8',      aadhaar: 'XXXX-XXXX-3218' },
  { citizenId: 'CIT010', name: 'Kavitha',          mobile: '9876543219', email: 'kavitha@gmail.com',  password: 'citizen123', ward: 'Ward 10', address: 'Housing Board, Ward 10',       aadhaar: 'XXXX-XXXX-3219' },
  { citizenId: 'CIT011', name: 'Gopal Das',        mobile: '9876543220', email: 'gopal@gmail.com',    password: 'citizen123', ward: 'Ward 12', address: 'Nagar Colony, Ward 12',        aadhaar: 'XXXX-XXXX-3220' },
  { citizenId: 'CIT012', name: 'Durga Prasad',     mobile: '9876543221', email: 'durga@gmail.com',    password: 'citizen123', ward: 'Ward 11', address: 'Srinagar Colony, Ward 11',     aadhaar: 'XXXX-XXXX-3221' },
  { citizenId: 'CIT013', name: 'Ramya Sri',        mobile: '9876543222', email: 'ramya@gmail.com',    password: 'citizen123', ward: 'Ward 15', address: 'School Road, Ward 15',         aadhaar: 'XXXX-XXXX-3222' },
  { citizenId: 'CIT014', name: 'Balakrishna',      mobile: '9876543223', email: 'bala@gmail.com',     password: 'citizen123', ward: 'Ward 13', address: 'Indira Colony, Ward 13',       aadhaar: 'XXXX-XXXX-3223' },
  { citizenId: 'CIT015', name: 'Sunita Verma',     mobile: '9876543224', email: 'sunita@gmail.com',   password: 'citizen123', ward: 'Ward 14', address: 'Lake View, Ward 14',           aadhaar: 'XXXX-XXXX-3224' },
  { citizenId: 'CIT016', name: 'Jaya Prakash',     mobile: '9876543225', email: 'jaya@gmail.com',     password: 'citizen123', ward: 'Ward 16', address: 'Fish Market, Ward 16',         aadhaar: 'XXXX-XXXX-3225' },
  { citizenId: 'CIT017', name: 'Manjula Rao',      mobile: '9876543226', email: 'manjula@gmail.com',  password: 'citizen123', ward: 'Ward 17', address: 'Railway Colony, Ward 17',      aadhaar: 'XXXX-XXXX-3226' },
  { citizenId: 'CIT018', name: 'Kishore Kumar',    mobile: '9876543227', email: 'kishore@gmail.com',  password: 'citizen123', ward: 'Ward 18', address: 'Subhash Nagar, Ward 18',       aadhaar: 'XXXX-XXXX-3227' },
  { citizenId: 'CIT019', name: 'Rekha Nair',       mobile: '9876543228', email: 'rekha@gmail.com',    password: 'citizen123', ward: 'Ward 19', address: 'East Colony, Ward 19',         aadhaar: 'XXXX-XXXX-3228' },
  { citizenId: 'CIT020', name: 'Sanjay Mehta',     mobile: '9876543229', email: 'sanjay@gmail.com',   password: 'citizen123', ward: 'Ward 20', address: 'Hospital Road, Ward 20',       aadhaar: 'XXXX-XXXX-3229' },
  { citizenId: 'CIT021', name: 'Priya Nandini',    mobile: '9876543230', email: 'priya@gmail.com',    password: 'citizen123', ward: 'Ward 21', address: 'College Road, Ward 21',        aadhaar: 'XXXX-XXXX-3230' },
  { citizenId: 'CIT022', name: 'Hanumantha Reddy', mobile: '9876543231', email: 'hanumantha@gmail.com',password:'citizen123', ward: 'Ward 22', address: 'Farmers Colony, Ward 22',      aadhaar: 'XXXX-XXXX-3231' },
  { citizenId: 'CIT023', name: 'Lalitha Krishna',  mobile: '9876543232', email: 'lalitha@gmail.com',  password: 'citizen123', ward: 'Ward 23', address: 'Ambedkar Nagar, Ward 23',      aadhaar: 'XXXX-XXXX-3232' },
  { citizenId: 'CIT024', name: 'Ramu Naidu',       mobile: '9876543233', email: 'ramu@gmail.com',     password: 'citizen123', ward: 'Ward 24', address: 'West End, Ward 24',            aadhaar: 'XXXX-XXXX-3233' },
  { citizenId: 'CIT025', name: 'Vijaya Bhaskara',  mobile: '9876543234', email: 'vijaya@gmail.com',   password: 'citizen123', ward: 'Ward 25', address: 'Bridge Road, Ward 25',         aadhaar: 'XXXX-XXXX-3234' },
  { citizenId: 'CIT026', name: 'Shanti Devi',      mobile: '9876543235', email: 'shanti@gmail.com',   password: 'citizen123', ward: 'Ward 26', address: 'Slum Area, Ward 26',           aadhaar: 'XXXX-XXXX-3235' },
  { citizenId: 'CIT027', name: 'Ashok Tiwari',     mobile: '9876543236', email: 'ashok@gmail.com',    password: 'citizen123', ward: 'Ward 27', address: 'Temple Street, Ward 27',       aadhaar: 'XXXX-XXXX-3236' },
  { citizenId: 'CIT028', name: 'Uma Maheshwari',   mobile: '9876543237', email: 'uma@gmail.com',      password: 'citizen123', ward: 'Ward 28', address: 'Kondapur, Ward 28',            aadhaar: 'XXXX-XXXX-3237' },
  { citizenId: 'CIT029', name: 'Srinivas Murthy',  mobile: '9876543238', email: 'srinivas@gmail.com', password: 'citizen123', ward: 'Ward 29', address: 'HMT Colony, Ward 29',          aadhaar: 'XXXX-XXXX-3238' },
  { citizenId: 'CIT030', name: 'Nagalakshmi',      mobile: '9876543239', email: 'naga@gmail.com',     password: 'citizen123', ward: 'Ward 30', address: 'ECIL Area, Ward 30',           aadhaar: 'XXXX-XXXX-3239' }
];

const officersData = [
  { officerCode: 'OFF001', name: 'K. Srikanth Reddy', email: 'water.officer@secretariat.gov.in',  officerId: 'WO-2024-001',  password: 'officer123', department: 'Water Officer',       category: 'Water Supply',  designation: 'Assistant Engineer',  phone: '040-27654321' },
  { officerCode: 'OFF002', name: 'P. Venkata Rao',    email: 'elec.officer@secretariat.gov.in',   officerId: 'EO-2024-002',  password: 'officer123', department: 'Electricity Officer', category: 'Electricity',   designation: 'Junior Engineer',      phone: '040-27654322' },
  { officerCode: 'OFF003', name: 'B. Ramesh Kumar',   email: 'roads.officer@secretariat.gov.in',  officerId: 'RO-2024-003',  password: 'officer123', department: 'Roads Officer',       category: 'Roads',         designation: 'Assistant Engineer',  phone: '040-27654323' },
  { officerCode: 'OFF004', name: 'M. Padmaja',        email: 'san.officer@secretariat.gov.in',    officerId: 'SO-2024-004',  password: 'officer123', department: 'Sanitation Officer',  category: 'Sanitation',    designation: 'Sanitary Inspector',  phone: '040-27654324' },
  { officerCode: 'OFF005', name: 'Dr. N. Sudhakar',   email: 'health.officer@secretariat.gov.in', officerId: 'HO-2024-005',  password: 'officer123', department: 'Health Officer',      category: 'Public Health', designation: 'Health Officer',      phone: '040-27654325' },
  { officerCode: 'OFF006', name: 'G. Laxmi Narayana', email: 'sl.officer@secretariat.gov.in',     officerId: 'SLO-2024-006', password: 'officer123', department: 'Electricity Officer', category: 'Street Lights', designation: 'Electrical Supervisor', phone: '040-27654326' },
  { officerCode: 'OFF007', name: 'S. Anantha Reddy',  email: 'drain.officer@secretariat.gov.in',  officerId: 'DO-2024-007',  password: 'officer123', department: 'Sanitation Officer',  category: 'Drainage',      designation: 'Drainage Inspector',  phone: '040-27654327' }
];

const noticesData = [
  { text: 'Secretariat office will remain closed on November 15th for State Formation Day.', date: new Date('2024-11-01'), isNew: true },
  { text: 'Citizens can now track their grievances online using the Complaint ID.', date: new Date('2024-10-28'), isNew: true },
  { text: 'Water supply will be disrupted in Wards 3, 5 and 7 on 10th November for pipeline maintenance work.', date: new Date('2024-10-25'), isNew: false },
  { text: 'New sanitation drive launched across all 30 wards. Please cooperate with the sanitation team.', date: new Date('2024-10-20'), isNew: false },
  { text: 'Deadline for property tax payment is November 30, 2024. Avoid penalty by paying on time.', date: new Date('2024-10-15'), isNew: false }
];

// 33 sample complaints across all categories and statuses
const complaintsData = [
  { complaintId: 'GRV-2024-0001', citizenId: 'CIT001', citizenName: 'Ravi Kumar', mobile: '9876543210', category: 'Water Supply', location: 'Ward 3, MG Road', title: 'No water supply for 5 days', description: 'There has been no water supply in our area for the past 5 days. We are facing severe water shortage. Tanker facility is also not available. Please look into this matter urgently.', status: 'Resolved', date: new Date('2024-11-01'), resolvedDate: new Date('2024-11-04'), officerRemark: 'Pipeline repaired. Water supply restored. Issue resolved.', assignedOfficer: 'Water Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0002', citizenId: 'CIT002', citizenName: 'Lakshmi Devi', mobile: '9876543211', category: 'Electricity', location: 'Ward 5, Nehru Street', title: 'Street lights not working', description: 'Five street lights on Nehru Street have been non-functional for the past 2 weeks. The area is completely dark at night causing safety issues especially for women.', status: 'In Progress', date: new Date('2024-11-03'), officerRemark: 'Electrician team dispatched. Replacement parts ordered.', assignedOfficer: 'Electricity Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0003', citizenId: 'CIT003', citizenName: 'Suresh Babu', mobile: '9876543212', category: 'Roads', location: 'Ward 7, RTC Colony', title: 'Large pothole on main road', description: 'There is a large pothole near the RTC Bus stop on the main road. Two bikes have already met with accidents. This is very dangerous especially during rains.', status: 'Pending', date: new Date('2024-11-05'), officerRemark: '', assignedOfficer: 'Roads Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0004', citizenId: 'CIT004', citizenName: 'Padmavathi', mobile: '9876543213', category: 'Drainage', location: 'Ward 2, Old Town', title: 'Blocked drainage causing water stagnation', description: 'The main drainage channel is blocked near the old market area. Water is stagnating and causing mosquito breeding. Foul smell is also coming from the area.', status: 'In Progress', date: new Date('2024-11-02'), officerRemark: 'Drainage cleaning work in progress. Expected to complete in 2 days.', assignedOfficer: 'Sanitation Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0005', citizenId: 'CIT005', citizenName: 'Venkatesh Rao', mobile: '9876543214', category: 'Sanitation', location: 'Ward 9, New Colony', title: 'Garbage not collected for a week', description: 'Garbage collection has not happened in New Colony for the past 7 days. Garbage is piling up and creating unhygienic conditions. Stray animals are spreading waste.', status: 'Resolved', date: new Date('2024-10-28'), resolvedDate: new Date('2024-10-30'), officerRemark: 'Garbage cleared. Route schedule updated. Regular collection resumed.', assignedOfficer: 'Sanitation Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0006', citizenId: 'CIT001', citizenName: 'Ravi Kumar', mobile: '9876543210', category: 'Street Lights', location: 'Ward 3, Park Road', title: 'Street lights malfunctioning near park', description: 'The street lights near Balapur Children Park are not working for 3 days. People are scared to use the park in the evening. Children cannot play safely.', status: 'Pending', date: new Date('2024-11-06'), officerRemark: '', assignedOfficer: 'Electricity Officer', priority: 'Low' },
  { complaintId: 'GRV-2024-0007', citizenId: 'CIT006', citizenName: 'Anita Sharma', mobile: '9876543215', category: 'Public Health', location: 'Ward 1, Market Area', title: 'Stale food being sold in market', description: 'Several vendors in the weekly market are selling stale and adulterated food. This is a serious public health concern. Cases of food poisoning have been reported.', status: 'In Progress', date: new Date('2024-11-04'), officerRemark: 'Health inspection team conducted raid. Notices issued to vendors.', assignedOfficer: 'Health Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0008', citizenId: 'CIT007', citizenName: 'Mohammed Farooq', mobile: '9876543216', category: 'Water Supply', location: 'Ward 6, Hassan Nagar', title: 'Contaminated water in taps', description: 'The water coming from taps in our area has a bad smell and brown color. Many families are falling sick. We suspect a pipeline leak is mixing sewage with water.', status: 'Resolved', date: new Date('2024-10-25'), resolvedDate: new Date('2024-10-28'), officerRemark: 'Pipeline leak found and fixed. Water tested and cleared safe.', assignedOfficer: 'Water Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0009', citizenId: 'CIT008', citizenName: 'Saraswathi', mobile: '9876543217', category: 'Drainage', location: 'Ward 4, Teachers Colony', title: 'Sewage overflow in residential area', description: 'Sewage is overflowing from the manholes in Teachers Colony. The entire road is flooded with sewage water. It is impossible to walk on the road.', status: 'Pending', date: new Date('2024-11-07'), officerRemark: '', assignedOfficer: 'Sanitation Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0010', citizenId: 'CIT009', citizenName: 'Narasimha Reddy', mobile: '9876543218', category: 'Roads', location: 'Ward 8, Industrial Area', title: 'Road needs repair before monsoon', description: 'The road in Industrial Area is badly damaged with multiple potholes and cracks. Heavy vehicles are damaging it further. It needs urgent repair before the monsoon season.', status: 'In Progress', date: new Date('2024-11-01'), officerRemark: 'Road repair work sanctioned. Contractor appointed.', assignedOfficer: 'Roads Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0011', citizenId: 'CIT010', citizenName: 'Kavitha', mobile: '9876543219', category: 'Public Health', location: 'Ward 10, Housing Board', title: 'Mosquito breeding in stagnant water', description: 'Large amounts of stagnant water have collected in unused plots near Housing Board. Mosquito menace has increased significantly. Dengue cases are being reported.', status: 'Pending', date: new Date('2024-11-08'), officerRemark: '', assignedOfficer: 'Health Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0012', citizenId: 'CIT002', citizenName: 'Lakshmi Devi', mobile: '9876543211', category: 'Sanitation', location: 'Ward 5, Bus Stand Area', title: 'Public toilet in unhygienic condition', description: 'The public toilet near the bus stand is extremely dirty and not being maintained. It is a health hazard. Women especially are unable to use it.', status: 'Resolved', date: new Date('2024-10-20'), resolvedDate: new Date('2024-10-23'), officerRemark: 'Deep cleaning done. Maintenance schedule set up. Cleaner assigned.', assignedOfficer: 'Sanitation Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0013', citizenId: 'CIT011', citizenName: 'Gopal Das', mobile: '9876543220', category: 'Electricity', location: 'Ward 12, Nagar Colony', title: 'Frequent power cuts affecting businesses', description: 'Our ward is facing 8-10 hours of power cuts daily for the past week. Small businesses are suffering heavy losses. Cold storage units are at risk.', status: 'In Progress', date: new Date('2024-11-03'), officerRemark: 'Issue escalated to DISCOM. Transformer upgrade ordered.', assignedOfficer: 'Electricity Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0014', citizenId: 'CIT012', citizenName: 'Durga Prasad', mobile: '9876543221', category: 'Water Supply', location: 'Ward 11, Srinagar Colony', title: 'Water supply for only 30 minutes daily', description: 'Our colony receives water supply for only 30 minutes in the morning. Overhead tanks are not getting filled. Multiple requests to the water department have been ignored.', status: 'Pending', date: new Date('2024-11-09'), officerRemark: '', assignedOfficer: 'Water Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0015', citizenId: 'CIT013', citizenName: 'Ramya Sri', mobile: '9876543222', category: 'Roads', location: 'Ward 15, School Road', title: 'No footpath near school', description: 'Children have to walk on the road near Government School as there is no footpath. This is very dangerous, especially during school hours. Speed breakers are also needed.', status: 'Resolved', date: new Date('2024-10-15'), resolvedDate: new Date('2024-10-22'), officerRemark: 'Footpath constructed. Speed breakers installed near school.', assignedOfficer: 'Roads Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0016', citizenId: 'CIT014', citizenName: 'Balakrishna', mobile: '9876543223', category: 'Street Lights', location: 'Ward 13, Indira Colony', title: '40% of street lights not working', description: 'About 40% of the street lights in Indira Colony are not working. The ward is poorly lit at night. Theft incidents have increased due to darkness.', status: 'Pending', date: new Date('2024-11-10'), officerRemark: '', assignedOfficer: 'Electricity Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0017', citizenId: 'CIT015', citizenName: 'Sunita Verma', mobile: '9876543224', category: 'Drainage', location: 'Ward 14, Lake View', title: 'Drainage near lake is choked', description: 'The drainage channel near Balapur Lake is completely choked. During rains, water backflows into houses. Several families have suffered property damage.', status: 'In Progress', date: new Date('2024-11-02'), officerRemark: 'Excavation work started. Drain capacity being increased.', assignedOfficer: 'Sanitation Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0018', citizenId: 'CIT016', citizenName: 'Jaya Prakash', mobile: '9876543225', category: 'Public Health', location: 'Ward 16, Fish Market', title: 'Improper disposal of fish waste', description: 'Fish waste is being dumped in open areas near the fish market. The smell is unbearable and is causing illness among nearby residents. Stray dogs are also a problem.', status: 'Resolved', date: new Date('2024-10-18'), resolvedDate: new Date('2024-10-21'), officerRemark: 'Waste disposal bins provided. Vendors warned. Fines imposed.', assignedOfficer: 'Health Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0019', citizenId: 'CIT017', citizenName: 'Manjula Rao', mobile: '9876543226', category: 'Others', location: 'Ward 17, Railway Colony', title: 'Stray dog menace near school', description: 'A pack of stray dogs near the school is terrorizing children. Two children have been bitten in the last month. We need urgent animal control measures.', status: 'In Progress', date: new Date('2024-11-05'), officerRemark: 'Animal control team contacted. Sterilization drive planned.', assignedOfficer: 'Health Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0020', citizenId: 'CIT018', citizenName: 'Kishore Kumar', mobile: '9876543227', category: 'Electricity', location: 'Ward 18, Subhash Nagar', title: 'Dangling live electric wire', description: 'A live electric wire is hanging dangerously low near the playground in Subhash Nagar. Children play near this area daily. This could cause electrocution any time.', status: 'Resolved', date: new Date('2024-10-30'), resolvedDate: new Date('2024-11-01'), officerRemark: 'Urgent action taken. Wire secured. Pole repaired.', assignedOfficer: 'Electricity Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0021', citizenId: 'CIT019', citizenName: 'Rekha Nair', mobile: '9876543228', category: 'Water Supply', location: 'Ward 19, East Colony', title: 'Water meter not reading correctly', description: 'My water meter is showing incorrect readings resulting in very high water bills for the past 3 months. I have complained earlier but no action was taken.', status: 'Pending', date: new Date('2024-11-11'), officerRemark: '', assignedOfficer: 'Water Officer', priority: 'Low' },
  { complaintId: 'GRV-2024-0022', citizenId: 'CIT020', citizenName: 'Sanjay Mehta', mobile: '9876543229', category: 'Roads', location: 'Ward 20, Hospital Road', title: 'Road waterlogged blocking hospital access', description: 'The road leading to the Government Hospital gets completely waterlogged during rain. Ambulances are unable to pass. This is a life-threatening situation.', status: 'In Progress', date: new Date('2024-11-04'), officerRemark: 'Emergency de-silting work in progress. Temporary drainage being created.', assignedOfficer: 'Roads Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0023', citizenId: 'CIT003', citizenName: 'Suresh Babu', mobile: '9876543212', category: 'Sanitation', location: 'Ward 7, Market Street', title: 'Overflowing garbage bins', description: 'The garbage bins on Market Street are overflowing for days without collection. The mess is spreading across the footpath and into shops. Health risk is high.', status: 'Resolved', date: new Date('2024-10-22'), resolvedDate: new Date('2024-10-24'), officerRemark: 'Bins emptied. Frequency of collection increased in this area.', assignedOfficer: 'Sanitation Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0024', citizenId: 'CIT021', citizenName: 'Priya Nandini', mobile: '9876543230', category: 'Street Lights', location: 'Ward 21, College Road', title: 'Street lights on all night wasting power', description: 'Street lights in our area remain on throughout the day wasting electricity. Despite multiple complaints, no automated timer or sensor has been installed.', status: 'Pending', date: new Date('2024-11-12'), officerRemark: '', assignedOfficer: 'Electricity Officer', priority: 'Low' },
  { complaintId: 'GRV-2024-0025', citizenId: 'CIT022', citizenName: 'Hanumantha Reddy', mobile: '9876543231', category: 'Drainage', location: 'Ward 22, Farmers Colony', title: 'Agricultural drainage blocked', description: 'The drainage canal near the agricultural fields is blocked. Farmlands are getting flooded. Crops have been damaged. Farmers are suffering heavy losses.', status: 'In Progress', date: new Date('2024-11-01'), officerRemark: 'Irrigation department informed. Desilting of canal under process.', assignedOfficer: 'Sanitation Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0026', citizenId: 'CIT023', citizenName: 'Lalitha Krishna', mobile: '9876543232', category: 'Public Health', location: 'Ward 23, Ambedkar Nagar', title: 'Food poisoning outbreak in school', description: '7 students fell ill after eating mid-day meal in Government Primary School. Symptoms of food poisoning reported. School canteen hygiene is extremely poor.', status: 'Resolved', date: new Date('2024-10-12'), resolvedDate: new Date('2024-10-14'), officerRemark: 'Canteen inspected. Contractor changed. Food quality norms enforced.', assignedOfficer: 'Health Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0027', citizenId: 'CIT024', citizenName: 'Ramu Naidu', mobile: '9876543233', category: 'Water Supply', location: 'Ward 24, West End', title: 'New connection not provided despite payment', description: 'I applied for a new water connection and paid the fees 3 months ago. Despite follow-ups, the connection has not been given. I need urgent resolution.', status: 'In Progress', date: new Date('2024-11-06'), officerRemark: 'Application verified. Work order issued to plumbing contractor.', assignedOfficer: 'Water Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0028', citizenId: 'CIT025', citizenName: 'Vijaya Bhaskara', mobile: '9876543234', category: 'Roads', location: 'Ward 25, Bridge Road', title: 'Bridge railing damaged — safety risk', description: 'The railing of the small bridge on Bridge Road is broken. Two persons have already fallen near this area. It is very dangerous for pedestrians, especially at night.', status: 'Pending', date: new Date('2024-11-13'), officerRemark: '', assignedOfficer: 'Roads Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0029', citizenId: 'CIT026', citizenName: 'Shanti Devi', mobile: '9876543235', category: 'Sanitation', location: 'Ward 26, Slum Area', title: 'No sanitation facility in slum area', description: 'Our community in the slum area has no proper sanitation facility. People are forced to practice open defecation. Children are getting ill. We need immediate sanitation infrastructure.', status: 'In Progress', date: new Date('2024-10-28'), officerRemark: 'Survey completed. Proposal for community toilet submitted for approval.', assignedOfficer: 'Sanitation Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0030', citizenId: 'CIT027', citizenName: 'Ashok Tiwari', mobile: '9876543236', category: 'Others', location: 'Ward 27, Temple Street', title: 'Encroachment on public road by shops', description: 'Shops on Temple Street have extended their counters onto the public road. The road is now half its original width. Traffic jams and accidents are happening regularly.', status: 'Pending', date: new Date('2024-11-14'), officerRemark: '', assignedOfficer: 'Roads Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0031', citizenId: 'CIT028', citizenName: 'Uma Maheshwari', mobile: '9876543237', category: 'Electricity', location: 'Ward 28, Kondapur', title: 'High voltage fluctuation damaging appliances', description: 'Severe voltage fluctuations are occurring in our area. Several TV sets, refrigerators and fans have been damaged. We have not received compensation.', status: 'Resolved', date: new Date('2024-10-08'), resolvedDate: new Date('2024-10-12'), officerRemark: 'Voltage regulator installed. Compensation claims being processed.', assignedOfficer: 'Electricity Officer', priority: 'Medium' },
  { complaintId: 'GRV-2024-0032', citizenId: 'CIT029', citizenName: 'Srinivas Murthy', mobile: '9876543238', category: 'Water Supply', location: 'Ward 29, HMT Colony', title: 'Water pipeline burst on main road', description: 'The main water pipeline on HMT Colony Road has burst. Water is flowing onto the road for 2 days causing traffic disruption and water wastage.', status: 'Resolved', date: new Date('2024-10-05'), resolvedDate: new Date('2024-10-06'), officerRemark: 'Emergency repair completed within 24 hours. Pipeline replaced.', assignedOfficer: 'Water Officer', priority: 'High' },
  { complaintId: 'GRV-2024-0033', citizenId: 'CIT030', citizenName: 'Nagalakshmi', mobile: '9876543239', category: 'Public Health', location: 'Ward 30, ECIL Area', title: 'Illegal chemical waste dumping', description: 'A factory is illegally dumping chemical waste near the residential area. The water in the area has turned yellowish. Skin diseases are increasing among residents.', status: 'In Progress', date: new Date('2024-11-07'), officerRemark: 'PCB team notified. Samples collected for testing. Legal action initiated.', assignedOfficer: 'Health Officer', priority: 'High' }
];

// =============================================
// SEED LOGIC
// =============================================

async function seedDatabase() {
  try {
    console.log('🔌  Connecting to MongoDB...');
    await mongoose.connect(config.mongo.uri);
    console.log(`✅  Connected to: ${config.mongo.uri}\n`);

    const fresh = process.argv.includes('--fresh');

    if (fresh) {
      console.log('🧹  Dropping existing collections (--fresh flag detected)...');
      await Promise.all([
        Citizen.deleteMany({}),
        Officer.deleteMany({}),
        Complaint.deleteMany({}),
        Notice.deleteMany({})
      ]);
      console.log('✅  Collections cleared.\n');
    }

    // ---- Seed Citizens ----
    console.log('👤  Seeding citizens...');
    let citizenCount = 0;
    for (const c of citizensData) {
      const exists = await Citizen.findOne({ citizenId: c.citizenId });
      if (!exists) {
        await Citizen.create(c); // password hashed via pre-save hook
        citizenCount++;
      }
    }
    console.log(`✅  ${citizenCount} citizens inserted (${citizensData.length - citizenCount} already existed).\n`);

    // ---- Seed Officers ----
    console.log('👮  Seeding officers...');
    let officerCount = 0;
    for (const o of officersData) {
      const exists = await Officer.findOne({ officerId: o.officerId });
      if (!exists) {
        await Officer.create(o); // password hashed via pre-save hook
        officerCount++;
      }
    }
    console.log(`✅  ${officerCount} officers inserted (${officersData.length - officerCount} already existed).\n`);

    // ---- Seed Complaints ----
    console.log('📋  Seeding complaints...');
    let complaintCount = 0;
    for (const comp of complaintsData) {
      const exists = await Complaint.findOne({ complaintId: comp.complaintId });
      if (!exists) {
        await Complaint.create(comp);
        complaintCount++;
      }
    }
    console.log(`✅  ${complaintCount} complaints inserted (${complaintsData.length - complaintCount} already existed).\n`);

    // ---- Seed Notices ----
    console.log('📢  Seeding notices...');
    let noticeCount = 0;
    for (const n of noticesData) {
      const exists = await Notice.findOne({ text: n.text });
      if (!exists) {
        await Notice.create(n);
        noticeCount++;
      }
    }
    console.log(`✅  ${noticeCount} notices inserted (${noticesData.length - noticeCount} already existed).\n`);

    console.log('🎉  Database seeding completed successfully!\n');
    console.log('---- Demo Login Credentials ----');
    console.log('Citizen Login : mobile 9876543210 / password citizen123');
    console.log('Officer Login : officerId WO-2024-001 / password officer123');
    console.log('---------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();
