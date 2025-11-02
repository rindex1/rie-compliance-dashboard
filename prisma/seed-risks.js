const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map user categories to RiskCategory enum
const categoryMap = {
  'Physical Risks': 'PHYSICAL_WORKSPACE',
  'Chemical & Biological Risks': 'CHEMICAL_BIOLOGICAL',
  'Ergonomic Risks': 'PHYSICAL_STRAIN',
  'Psychosocial Risks': 'PSYCHOSOCIAL',
  'Transport & Mobile Work Risks': 'SAFETY_RISKS',
  'Workplace & Environment Risks': 'ENVIRONMENTAL',
  'Equipment & Machinery Risks': 'SAFETY_RISKS',
};

const riskTemplates = [
  // 🏗️ Physical Risks
  { category: 'Physical Risks', title: 'Slips, trips and falls on same level', controls: 'Keep walkways clear, maintain good housekeeping, use anti-slip flooring, adequate lighting' },
  { category: 'Physical Risks', title: 'Falls from height', controls: 'Use guardrails, safety harnesses, scaffolding, fall arrest systems, edge protection' },
  { category: 'Physical Risks', title: 'Falling objects', controls: 'Use toe boards, safety nets, hard hats, secure storage at height, restricted access zones' },
  { category: 'Physical Risks', title: 'Struck by moving vehicles', controls: 'Segregate pedestrians and vehicles, use mirrors, alarms, high-visibility clothing, traffic management' },
  { category: 'Physical Risks', title: 'Struck by moving machinery', controls: 'Machine guards, emergency stops, lockout/tagout procedures, safe operating distances' },
  { category: 'Physical Risks', title: 'Contact with sharp objects', controls: 'Use guards, cut-resistant gloves, safe handling procedures, tool maintenance' },
  { category: 'Physical Risks', title: 'Entanglement in machinery', controls: 'Remove loose clothing/jewelry, use guards, emergency stop buttons, training' },
  { category: 'Physical Risks', title: 'Crushing injuries', controls: 'Use barriers, warning signs, lockout/tagout, load securing, proper lifting equipment' },
  { category: 'Physical Risks', title: 'Noise exposure', controls: 'Hearing protection, noise reduction at source, acoustic enclosures, exposure monitoring' },
  { category: 'Physical Risks', title: 'Vibration exposure (hand-arm)', controls: 'Use anti-vibration tools, limit exposure time, regular breaks, health surveillance' },
  { category: 'Physical Risks', title: 'Vibration exposure (whole-body)', controls: 'Suspended seats, vehicle maintenance, route planning, exposure limits' },
  { category: 'Physical Risks', title: 'Extreme temperatures (heat)', controls: 'Ventilation, air conditioning, hydration stations, work-rest schedules, acclimatization' },
  { category: 'Physical Risks', title: 'Extreme temperatures (cold)', controls: 'Thermal clothing, heated areas, warm drinks, work rotation, wind protection' },
  { category: 'Physical Risks', title: 'Inadequate lighting', controls: 'Ensure minimum lux levels, task lighting, emergency lighting, regular maintenance' },
  { category: 'Physical Risks', title: 'Glare and eye strain', controls: 'Anti-glare screens, blinds, proper positioning, regular eye tests, breaks' },
  { category: 'Physical Risks', title: 'Radiation (ionizing)', controls: 'Shielding, distance, time limits, monitoring, controlled areas, dosimeters' },
  { category: 'Physical Risks', title: 'Radiation (non-ionizing)', controls: 'Shielding, safety distances, exposure limits, warning signs, laser safety glasses' },
  { category: 'Physical Risks', title: 'Electrical shock', controls: 'RCD protection, PAT testing, proper insulation, lockout/tagout, qualified electricians' },
  { category: 'Physical Risks', title: 'Burns from hot surfaces', controls: 'Insulation, guards, warning signs, heat-resistant gloves, training' },
  { category: 'Physical Risks', title: 'Confined spaces', controls: 'Permit system, atmospheric testing, ventilation, rescue plans, trained personnel' },
  { category: 'Physical Risks', title: 'Uneven surfaces', controls: 'Level floors, repair damage, warning signs, proper footwear, good lighting' },
  { category: 'Physical Risks', title: 'Wet or slippery floors', controls: 'Drainage, drying procedures, warning signs, non-slip footwear, cleaning protocols' },
  { category: 'Physical Risks', title: 'Trailing cables', controls: 'Cable management, overhead routing, cable covers, wireless alternatives, inspection' },
  { category: 'Physical Risks', title: 'Working on roofs', controls: 'Edge protection, anchor points, safety nets, weather restrictions, competent contractors' },
  { category: 'Physical Risks', title: 'Access to high storage', controls: 'Proper access equipment, storage redesign, reduce manual access, safe retrieval systems' },
  { category: 'Physical Risks', title: 'Pinch points', controls: 'Guards, awareness training, slow operation, marking hazard zones, two-hand controls' },
  { category: 'Physical Risks', title: 'Flying particles', controls: 'Eye protection, machine guards, extraction systems, enclosed processes, safety screens' },
  { category: 'Physical Risks', title: 'Dust explosions', controls: 'Dust extraction, ignition control, explosion venting, housekeeping, ATEX compliance' },
  { category: 'Physical Risks', title: 'Static electricity', controls: 'Earthing/bonding, humidity control, anti-static flooring, conductive footwear, discharge devices' },
  { category: 'Physical Risks', title: 'UV exposure (outdoors)', controls: 'Sun protection, clothing, sunscreen, shade structures, work scheduling, awareness' },

  // 🧪 Chemical & Biological Risks
  { category: 'Chemical & Biological Risks', title: 'Exposure to toxic chemicals', controls: 'Substitution, ventilation, PPE, storage controls, SDS availability, training' },
  { category: 'Chemical & Biological Risks', title: 'Skin contact with irritants', controls: 'Protective gloves, barrier creams, washing facilities, material substitution' },
  { category: 'Chemical & Biological Risks', title: 'Inhalation of dust', controls: 'Dust extraction, wet methods, respiratory protection, exposure monitoring' },
  { category: 'Chemical & Biological Risks', title: 'Inhalation of fumes', controls: 'Local exhaust ventilation, respiratory protection, process enclosure, air monitoring' },
  { category: 'Chemical & Biological Risks', title: 'Inhalation of gases', controls: 'Ventilation, gas detection, respiratory protection, emergency procedures' },
  { category: 'Chemical & Biological Risks', title: 'Chemical spills', controls: 'Spill kits, containment, training, storage controls, emergency procedures' },
  { category: 'Chemical & Biological Risks', title: 'Fire from flammable materials', controls: 'Proper storage, no ignition sources, fire extinguishers, ventilation, training' },
  { category: 'Chemical & Biological Risks', title: 'Explosion risks', controls: 'ATEX assessment, proper ventilation, earthing/bonding, explosion relief, hot work permits' },
  { category: 'Chemical & Biological Risks', title: 'Asbestos exposure', controls: 'Survey, encapsulation, licensed removal, respiratory protection, monitoring' },
  { category: 'Chemical & Biological Risks', title: 'Biological agents (bacteria, viruses)', controls: 'Hygiene measures, vaccination, PPE, waste disposal, exposure control' },
  { category: 'Chemical & Biological Risks', title: 'Legionella in water systems', controls: 'Regular testing, temperature control, cleaning, risk assessment, dead leg removal' },
  { category: 'Chemical & Biological Risks', title: 'Mold and fungi', controls: 'Moisture control, ventilation, cleaning, removal, building maintenance' },
  { category: 'Chemical & Biological Risks', title: 'Allergens', controls: 'Identify allergens, ventilation, hygiene, substitution, health surveillance' },
  { category: 'Chemical & Biological Risks', title: 'Carcinogenic substances', controls: 'Substitution, enclosure, ventilation, PPE, health surveillance, exposure limits' },
  { category: 'Chemical & Biological Risks', title: 'Skin sensitizers', controls: 'Avoid contact, protective gloves, washing facilities, product substitution' },
  { category: 'Chemical & Biological Risks', title: 'Corrosive materials', controls: 'PPE, storage controls, spill procedures, eye wash stations, showers' },
  { category: 'Chemical & Biological Risks', title: 'Oxidizing agents', controls: 'Separate storage, avoid combustibles, proper handling, training, fire prevention' },
  { category: 'Chemical & Biological Risks', title: 'Compressed gases', controls: 'Secure cylinders, storage controls, pressure relief, proper fittings, leak detection' },
  { category: 'Chemical & Biological Risks', title: 'Waste chemical disposal', controls: 'Licensed disposal, segregation, labeling, storage, documentation' },
  { category: 'Chemical & Biological Risks', title: 'Inadequate ventilation', controls: 'Install LEV, regular testing, maintenance, airflow checks, exposure monitoring' },
  { category: 'Chemical & Biological Risks', title: 'Solvent exposure', controls: 'Substitution, enclosed systems, ventilation, skin protection, health surveillance' },
  { category: 'Chemical & Biological Risks', title: 'Acid/alkali burns', controls: 'PPE, dilution procedures, neutralization, eye wash stations, emergency showers' },
  { category: 'Chemical & Biological Risks', title: 'Mercury exposure', controls: 'Substitution, spillage procedures, vapor suppression, monitoring, proper disposal' },
  { category: 'Chemical & Biological Risks', title: 'Lead exposure', controls: 'Substitution, enclosure, hygiene measures, blood lead monitoring, respiratory protection' },
  { category: 'Chemical & Biological Risks', title: 'Pesticide exposure', controls: 'Licensed applicators, PPE, restricted access, drift control, storage security' },
  { category: 'Chemical & Biological Risks', title: 'Welding fumes', controls: 'LEV extraction, respiratory protection, substitution, position/posture, air monitoring' },
  { category: 'Chemical & Biological Risks', title: 'Paint/coating fumes', controls: 'Spray booths, ventilation, respiratory protection, low-VOC alternatives, permit system' },
  { category: 'Chemical & Biological Risks', title: 'Nanomaterial exposure', controls: 'Enclosure, HEPA filters, risk assessment, PPE, minimize dust generation' },
  { category: 'Chemical & Biological Risks', title: 'Oxygen deficiency', controls: 'Atmospheric monitoring, ventilation, confined space procedures, oxygen meters, rescue plan' },
  { category: 'Chemical & Biological Risks', title: 'Bloodborne pathogens', controls: 'Universal precautions, sharps disposal, vaccination, exposure control plan, training' },

  // 🪑 Ergonomic Risks
  { category: 'Ergonomic Risks', title: 'Manual handling injuries', controls: 'Lifting aids, training, load limits, good technique, team lifting' },
  { category: 'Ergonomic Risks', title: 'Repetitive strain injuries', controls: 'Job rotation, ergonomic tools, breaks, workstation design, stretching exercises' },
  { category: 'Ergonomic Risks', title: 'Awkward postures', controls: 'Workstation adjustment, tool redesign, task variety, training, ergonomic assessment' },
  { category: 'Ergonomic Risks', title: 'Prolonged sitting', controls: 'Sit-stand desks, regular breaks, exercise, ergonomic chairs, movement prompts' },
  { category: 'Ergonomic Risks', title: 'Prolonged standing', controls: 'Anti-fatigue mats, footrests, seating options, task rotation, supportive footwear' },
  { category: 'Ergonomic Risks', title: 'Computer workstation setup', controls: 'DSE assessment, adjustable furniture, screen positioning, keyboard/mouse setup' },
  { category: 'Ergonomic Risks', title: 'Forceful exertions', controls: 'Power tools, mechanical aids, job rotation, proper tools, training' },
  { category: 'Ergonomic Risks', title: 'Lack of rest breaks', controls: 'Scheduled breaks, micro-breaks, task rotation, work planning' },
  { category: 'Ergonomic Risks', title: 'Inadequate workspace', controls: 'Ensure minimum space, reorganize layout, remove obstructions' },
  { category: 'Ergonomic Risks', title: 'Poor tool design', controls: 'Ergonomic tools, right tool for job, maintenance, training, worker feedback' },
  { category: 'Ergonomic Risks', title: 'Reaching and stretching', controls: 'Storage optimization, work height adjustment, reduce reach distances, access platforms' },
  { category: 'Ergonomic Risks', title: 'Kneeling or squatting', controls: 'Knee pads, work height adjustment, mechanical aids, task redesign, rotation' },
  { category: 'Ergonomic Risks', title: 'Overhead work', controls: 'Adjustable platforms, mechanical aids, task redesign, frequent breaks, tool balancers' },
  { category: 'Ergonomic Risks', title: 'Grip force requirements', controls: 'Ergonomic handles, power-assisted tools, glove selection, grip aids, tool maintenance' },
  { category: 'Ergonomic Risks', title: 'Bending and twisting', controls: 'Work height adjustment, layout redesign, mechanical aids, training, task rotation' },
  { category: 'Ergonomic Risks', title: 'One-handed operation', controls: 'Two-handed design, support systems, tool balancers, task redesign' },
  { category: 'Ergonomic Risks', title: 'Fine motor control fatigue', controls: 'Magnification, proper lighting, tool selection, breaks, task rotation' },
  { category: 'Ergonomic Risks', title: 'Foot pedal operation', controls: 'Adjustable pedals, alternative controls, anti-fatigue mats, workstation design' },
  { category: 'Ergonomic Risks', title: 'Static muscle loading', controls: 'Task variety, micro-breaks, posture changes, workstation design, support systems' },
  { category: 'Ergonomic Risks', title: 'Cold tool handling', controls: 'Insulated handles, heated grips, thermal gloves, warm-up procedures' },
  { category: 'Ergonomic Risks', title: 'Vibrating tool use', controls: 'Anti-vibration gloves, tool selection, exposure limits, maintenance, health surveillance' },
  { category: 'Ergonomic Risks', title: 'Mouse and keyboard intensive work', controls: 'Ergonomic peripherals, shortcuts, voice recognition, breaks, proper positioning' },
  { category: 'Ergonomic Risks', title: 'Phone cradling', controls: 'Headsets, speakerphone, proper technique, workstation setup' },
  { category: 'Ergonomic Risks', title: 'Document handling', controls: 'Document holders, screen positioning, OCR/digitization, proper lighting' },
  { category: 'Ergonomic Risks', title: 'Repetitive assembly work', controls: 'Automation, job rotation, workstation design, ergonomic tools, pacing control' },
  { category: 'Ergonomic Risks', title: 'Packing and unpacking', controls: 'Work height adjustment, mechanical aids, varied tasks, team approach' },
  { category: 'Ergonomic Risks', title: 'Driving long distances', controls: 'Vehicle ergonomics, regular breaks, seat adjustment, vibration reduction' },
  { category: 'Ergonomic Risks', title: 'Sustained attention tasks', controls: 'Task variety, breaks, environmental design, workload management' },
  { category: 'Ergonomic Risks', title: 'Precision assembly work', controls: 'Magnification, lighting, tool selection, work surface, posture support' },
  { category: 'Ergonomic Risks', title: 'Heavy pushing/pulling', controls: 'Wheeled equipment, powered transport, floor maintenance, handle design, team approach' },

  // 🧠 Psychosocial Risks
  { category: 'Psychosocial Risks', title: 'Work-related stress', controls: 'Workload management, support systems, training, clear roles, counseling' },
  { category: 'Psychosocial Risks', title: 'Workplace bullying', controls: 'Anti-bullying policy, reporting procedures, training, investigation process' },
  { category: 'Psychosocial Risks', title: 'Workplace harassment', controls: 'Clear policy, reporting channels, training, zero tolerance, support' },
  { category: 'Psychosocial Risks', title: 'Violence and aggression', controls: 'Lone worker protection, panic alarms, training, security measures' },
  { category: 'Psychosocial Risks', title: 'Excessive workload', controls: 'Resource planning, realistic deadlines, prioritization, management support' },
  { category: 'Psychosocial Risks', title: 'Lack of job control', controls: 'Involve workers in decisions, autonomy, flexibility, consultation' },
  { category: 'Psychosocial Risks', title: 'Poor work-life balance', controls: 'Flexible working, reasonable hours, no overtime pressure, leave policies' },
  { category: 'Psychosocial Risks', title: 'Role ambiguity', controls: 'Clear job descriptions, communication, supervision, team meetings' },
  { category: 'Psychosocial Risks', title: 'Job insecurity', controls: 'Communication, transparency, consultation, support during changes' },
  { category: 'Psychosocial Risks', title: 'Lack of support', controls: 'Management training, peer support, mentoring, open communication' },
  { category: 'Psychosocial Risks', title: 'Monotonous work', controls: 'Job rotation, task variety, enrichment, breaks, training opportunities' },
  { category: 'Psychosocial Risks', title: 'Shift work and night work', controls: 'Limit night shifts, forward rotation, rest periods, health surveillance' },
  { category: 'Psychosocial Risks', title: 'Lone working', controls: 'Check-in systems, communication devices, risk assessment, emergency procedures' },
  { category: 'Psychosocial Risks', title: 'Working with difficult clients', controls: 'Training, support, de-escalation techniques, security measures' },
  { category: 'Psychosocial Risks', title: 'Organizational change', controls: 'Communication, consultation, support, phased implementation, training' },
  { category: 'Psychosocial Risks', title: 'Lack of training', controls: 'Induction programs, ongoing training, competency assessment, development plans' },
  { category: 'Psychosocial Risks', title: 'Poor communication', controls: 'Regular meetings, clear channels, feedback systems, team briefings' },
  { category: 'Psychosocial Risks', title: 'Discrimination', controls: 'Equal opportunities policy, training, reporting procedures, diversity initiatives' },
  { category: 'Psychosocial Risks', title: 'Emotional demands', controls: 'Support systems, counseling, supervision, debriefing, training' },
  { category: 'Psychosocial Risks', title: 'Inadequate rest facilities', controls: 'Provide break rooms, seating, eating areas, quiet spaces' },
  { category: 'Psychosocial Risks', title: 'Conflict with colleagues', controls: 'Conflict resolution procedures, mediation, team building, communication training' },
  { category: 'Psychosocial Risks', title: 'Unrealistic performance targets', controls: 'Realistic goal setting, consultation, regular review, resource allocation' },
  { category: 'Psychosocial Risks', title: 'Lack of recognition', controls: 'Recognition programs, feedback systems, performance reviews, appreciation culture' },
  { category: 'Psychosocial Risks', title: 'Inadequate resources', controls: 'Resource assessment, budget allocation, equipment provision, staffing levels' },
  { category: 'Psychosocial Risks', title: 'Tight deadlines', controls: 'Realistic scheduling, buffer time, prioritization, workload distribution' },
  { category: 'Psychosocial Risks', title: 'On-call requirements', controls: 'Compensation, rotation, rest periods, support, clear expectations' },
  { category: 'Psychosocial Risks', title: 'Exposure to trauma', controls: 'Counseling, debriefing, peer support, professional help, time off' },
  { category: 'Psychosocial Risks', title: 'Work intensification', controls: 'Workload monitoring, efficiency vs. pressure balance, breaks, resource support' },
  { category: 'Psychosocial Risks', title: 'Presenteeism pressure', controls: 'Sick leave policy, culture change, management training, health support' },
  { category: 'Psychosocial Risks', title: 'Career development concerns', controls: 'Development plans, training opportunities, progression pathways, mentoring' },

  // 🚗 Transport & Mobile Work Risks
  { category: 'Transport & Mobile Work Risks', title: 'Road traffic accidents', controls: 'Driver training, vehicle maintenance, journey planning, rest breaks, policy' },
  { category: 'Transport & Mobile Work Risks', title: 'Driving while fatigued', controls: 'Journey planning, rest breaks, two-driver policy, fatigue management' },
  { category: 'Transport & Mobile Work Risks', title: 'Use of mobile phones while driving', controls: 'Hands-free only, no texting policy, stop to call, enforcement' },
  { category: 'Transport & Mobile Work Risks', title: 'Poor vehicle maintenance', controls: 'Regular servicing, inspection checks, defect reporting, maintenance records' },
  { category: 'Transport & Mobile Work Risks', title: 'Loading and unloading vehicles', controls: 'Safe systems, loading bays, equipment, training, segregation' },
  { category: 'Transport & Mobile Work Risks', title: 'Working at temporary sites', controls: 'Site induction, risk assessment, PPE, supervision, communication' },
  { category: 'Transport & Mobile Work Risks', title: 'Working in public areas', controls: 'High-visibility clothing, barriers, signage, traffic management, public liaison' },
  { category: 'Transport & Mobile Work Risks', title: 'Weather conditions affecting travel', controls: 'Journey planning, weather monitoring, postponement policy, winter equipment' },
  { category: 'Transport & Mobile Work Risks', title: 'Reversing vehicles', controls: 'Banksmen, cameras, sensors, mirrors, one-way systems, exclusion zones' },
  { category: 'Transport & Mobile Work Risks', title: 'Pedestrian-vehicle interaction', controls: 'Segregation, crossings, speed limits, signage, visibility measures' },
  { category: 'Transport & Mobile Work Risks', title: 'Speeding', controls: 'Speed limiters, monitoring, training, policy enforcement, route selection' },
  { category: 'Transport & Mobile Work Risks', title: 'Aggressive driving', controls: 'Driver training, monitoring, reporting system, disciplinary procedures, support' },
  { category: 'Transport & Mobile Work Risks', title: 'Inadequate driver training', controls: 'Competency assessment, refresher training, advanced courses, specific vehicle training' },
  { category: 'Transport & Mobile Work Risks', title: 'Transporting hazardous materials', controls: 'ADR compliance, training, vehicle specification, placarding, emergency procedures' },
  { category: 'Transport & Mobile Work Risks', title: 'Insecure loads', controls: 'Load securing training, equipment provision, inspection procedures, weight limits' },
  { category: 'Transport & Mobile Work Risks', title: 'Overloading vehicles', controls: 'Weight limits, monitoring, enforcement, load planning, weighing procedures' },
  { category: 'Transport & Mobile Work Risks', title: 'Blind spots', controls: 'Mirrors, cameras, sensors, awareness training, vehicle selection' },
  { category: 'Transport & Mobile Work Risks', title: 'Door opening hazards', controls: 'Check mirrors, look before opening, consider cycle lanes, training' },
  { category: 'Transport & Mobile Work Risks', title: 'Getting in/out of vehicles', controls: 'Three-point contact, grab handles, proper footwear, vehicle maintenance' },
  { category: 'Transport & Mobile Work Risks', title: 'Breakdown on roadside', controls: 'Emergency procedures, high-visibility clothing, warning triangles, safe location, assistance' },
  { category: 'Transport & Mobile Work Risks', title: 'Driving in unfamiliar areas', controls: 'Route planning, GPS/navigation, advance research, allow extra time' },
  { category: 'Transport & Mobile Work Risks', title: 'Night driving', controls: 'Lighting checks, fatigue management, speed reduction, high-visibility, route selection' },
  { category: 'Transport & Mobile Work Risks', title: 'Motorway driving', controls: 'Training, breakdown procedures, safe stopping, speed management, lane discipline' },
  { category: 'Transport & Mobile Work Risks', title: 'Parking hazards', controls: 'Secure parking, lighting, personal safety, vehicle security, risk assessment' },
  { category: 'Transport & Mobile Work Risks', title: 'Working from vehicles', controls: 'Ergonomic setup, breaks, posture, equipment storage, climate control' },
  { category: 'Transport & Mobile Work Risks', title: 'Transporting passengers', controls: 'Safety briefings, seat belts, capacity limits, driver responsibility, emergency procedures' },
  { category: 'Transport & Mobile Work Risks', title: 'Towing trailers', controls: 'Training, license requirements, coupling checks, weight distribution, mirrors' },
  { category: 'Transport & Mobile Work Risks', title: 'Off-road driving', controls: 'Specialized training, vehicle capability, route assessment, communication, recovery equipment' },
  { category: 'Transport & Mobile Work Risks', title: 'Ferry or channel crossing', controls: 'Securing loads, driver rest, emergency procedures, vehicle checks' },
  { category: 'Transport & Mobile Work Risks', title: 'Multi-drop delivery stress', controls: 'Realistic scheduling, route optimization, support systems, workload management' },

  // 🏢 Workplace & Environment Risks
  { category: 'Workplace & Environment Risks', title: 'Fire in workplace', controls: 'Fire risk assessment, extinguishers, alarms, evacuation plan, training, drills' },
  { category: 'Workplace & Environment Risks', title: 'Blocked emergency exits', controls: 'Keep clear, signage, inspections, enforcement, emergency lighting' },
  { category: 'Workplace & Environment Risks', title: 'Inadequate first aid provision', controls: 'Trained first aiders, equipment, signage, procedures, records' },
  { category: 'Workplace & Environment Risks', title: 'Poor housekeeping', controls: 'Cleaning schedules, storage systems, inspections, waste removal, standards' },
  { category: 'Workplace & Environment Risks', title: 'Structural failure', controls: 'Building inspections, maintenance, load limits, competent contractors' },
  { category: 'Workplace & Environment Risks', title: 'Flooding', controls: 'Drainage maintenance, pumps, emergency plans, water detection, raised storage' },
  { category: 'Workplace & Environment Risks', title: 'Window cleaning at height', controls: 'Anchor points, harnesses, equipment inspection, training, risk assessment' },
  { category: 'Workplace & Environment Risks', title: 'Roof work', controls: 'Edge protection, safety nets, harnesses, competent contractors, permits' },
  { category: 'Workplace & Environment Risks', title: 'Excavation collapse', controls: 'Shoring, inspection, barriers, competent person, safe access/egress' },
  { category: 'Workplace & Environment Risks', title: 'Buried services', controls: 'Service location, permits, safe digging procedures, service drawings, CAT scanner' },
  { category: 'Workplace & Environment Risks', title: 'Inadequate emergency lighting', controls: 'Regular testing, battery checks, BS 5266 compliance, maintenance, adequate coverage' },
  { category: 'Workplace & Environment Risks', title: 'Defective fire alarms', controls: 'Weekly testing, servicing, BS 5839 compliance, backup power, maintenance' },
  { category: 'Workplace & Environment Risks', title: 'Overcrowding', controls: 'Occupancy limits, monitoring, space planning, evacuation capacity, signage' },
  { category: 'Workplace & Environment Risks', title: 'Poor air quality', controls: 'Ventilation systems, air testing, source control, CO2 monitoring, maintenance' },
  { category: 'Workplace & Environment Risks', title: 'Lack of drinking water', controls: 'Water provision, fountains, dispensers, hygiene, temperature control' },
  { category: 'Workplace & Environment Risks', title: 'Inadequate toilet facilities', controls: 'Sufficient numbers, hygiene, accessibility, maintenance, privacy' },
  { category: 'Workplace & Environment Risks', title: 'Inadequate washing facilities', controls: 'Hot water, soap, drying, cleanliness, maintenance, accessibility' },
  { category: 'Workplace & Environment Risks', title: 'No eating facilities', controls: 'Break rooms, food preparation, refrigeration, seating, hygiene' },
  { category: 'Workplace & Environment Risks', title: 'Temperature extremes (indoor)', controls: 'Heating, ventilation, thermostatic control, monitoring, reasonable temperature' },
  { category: 'Workplace & Environment Risks', title: 'Pest infestation', controls: 'Pest control, hygiene, waste management, sealing entry points, monitoring' },
  { category: 'Workplace & Environment Risks', title: 'Poor waste management', controls: 'Segregation, regular collection, adequate bins, hygiene, documentation' },
  { category: 'Workplace & Environment Risks', title: 'Glass in doors/partitions', controls: 'Safety glazing, manifestation, BS 6262 compliance, regular inspection' },
  { category: 'Workplace & Environment Risks', title: 'Sharp edges on furniture', controls: 'Edge protection, maintenance, proper selection, inspection' },
  { category: 'Workplace & Environment Risks', title: 'Unstable furniture', controls: 'Anchoring, stability checks, proper use, weight limits, maintenance' },
  { category: 'Workplace & Environment Risks', title: 'Slip hazards from cleaning', controls: 'Warning signs, dry cleaning methods, timing, proper products, training' },
  { category: 'Workplace & Environment Risks', title: 'Smoking areas', controls: 'Designated areas, signage, no smoking policy, enforcement, fire safety' },
  { category: 'Workplace & Environment Risks', title: 'Outdoor working areas', controls: 'Weather protection, lighting, surface condition, access, facilities' },
  { category: 'Workplace & Environment Risks', title: 'Access for disabled persons', controls: 'Ramps, lifts, door widths, facilities, parking, signage' },
  { category: 'Workplace & Environment Risks', title: 'Security threats', controls: 'Access control, CCTV, alarms, lighting, procedures, training' },
  { category: 'Workplace & Environment Risks', title: 'Natural disasters', controls: 'Emergency plans, early warning, evacuation procedures, business continuity, insurance' },

  // 🔧 Equipment & Machinery Risks
  { category: 'Equipment & Machinery Risks', title: 'Unguarded machinery', controls: 'Install guards, interlocks, fixed guards, emergency stops, maintenance' },
  { category: 'Equipment & Machinery Risks', title: 'Lack of machine maintenance', controls: 'Planned maintenance, inspection, records, competent persons, spare parts' },
  { category: 'Equipment & Machinery Risks', title: 'Work equipment not suitable', controls: 'Equipment selection, assessment, proper use, training, inspection' },
  { category: 'Equipment & Machinery Risks', title: 'Pressure system failure', controls: 'Regular inspection, written scheme, competent person, safety devices' },
  { category: 'Equipment & Machinery Risks', title: 'Lifting equipment failure', controls: 'LOLER inspection, testing, certification, planned maintenance, examination' },
  { category: 'Equipment & Machinery Risks', title: 'Power tool accidents', controls: 'Training, inspection, guards, right tool for job, PAT testing' },
  { category: 'Equipment & Machinery Risks', title: 'Abrasive wheels bursting', controls: 'Trained persons only, inspection, guards, correct mounting, speed limits' },
  { category: 'Equipment & Machinery Risks', title: 'Portable ladder falls', controls: 'Ladder inspection, 3-point contact, secured, right equipment, training' },
  { category: 'Equipment & Machinery Risks', title: 'Forklift truck accidents', controls: 'Licensed operators, inspection, segregation, load limits, speed restrictions' },
  { category: 'Equipment & Machinery Risks', title: 'Work at height equipment failure', controls: 'Inspection, testing, competent use, maintenance, certification records' },
  { category: 'Equipment & Machinery Risks', title: 'Circular saw accidents', controls: 'Guards, riving knife, push sticks, training, maintenance, blade selection' },
  { category: 'Equipment & Machinery Risks', title: 'Drill press injuries', controls: 'Guards, chuck keys removed, secure workpiece, training, inspection' },
  { category: 'Equipment & Machinery Risks', title: 'Lathe accidents', controls: 'Guards, chuck key removal, no loose clothing, training, secure work, emergency stops' },
  { category: 'Equipment & Machinery Risks', title: 'Milling machine hazards', controls: 'Guards, secure workpiece, correct speeds/feeds, training, inspection' },
  { category: 'Equipment & Machinery Risks', title: 'Grinder wheel injuries', controls: 'Correct wheel, guards, rest adjustment, eye protection, trained operators' },
  { category: 'Equipment & Machinery Risks', title: 'Pneumatic tool injuries', controls: 'Pressure regulation, maintenance, proper connections, safety clips, training' },
  { category: 'Equipment & Machinery Risks', title: 'Hydraulic equipment failure', controls: 'Pressure relief, regular inspection, leak detection, proper fluid, training' },
  { category: 'Equipment & Machinery Risks', title: 'Crane accidents', controls: 'Thorough examination, testing, load limits, trained operators, lift plans' },
  { category: 'Equipment & Machinery Risks', title: 'Hoist failure', controls: 'Regular inspection, testing, load limits, maintenance, certification' },
  { category: 'Equipment & Machinery Risks', title: 'Conveyor entanglement', controls: 'Guards, emergency stops, access restrictions, lockout, training' },
  { category: 'Equipment & Machinery Risks', title: 'Robot collision', controls: 'Safety fencing, light curtains, risk assessment, restricted access, training' },
  { category: 'Equipment & Machinery Risks', title: 'CNC machine hazards', controls: 'Interlocks, emergency stops, program verification, training, guarding' },
  { category: 'Equipment & Machinery Risks', title: 'Injection molding hazards', controls: 'Guards, interlocks, hot surface protection, training, maintenance' },
  { category: 'Equipment & Machinery Risks', title: 'Press brake injuries', controls: 'Light guards, two-hand controls, risk assessment, training, proper tooling' },
  { category: 'Equipment & Machinery Risks', title: 'Bandsaw accidents', controls: 'Guards, blade tension, guide adjustment, push sticks, training' },
  { category: 'Equipment & Machinery Risks', title: 'Chainsaw injuries', controls: 'PPE, training, maintenance, kickback protection, proper technique, certification' },
  { category: 'Equipment & Machinery Risks', title: 'Angle grinder accidents', controls: 'Guards, correct disc, two-hand operation, PPE, inspection' },
  { category: 'Equipment & Machinery Risks', title: 'Nail gun injuries', controls: 'Sequential trigger, training, maintenance, no free discharge, proper loading' },
  { category: 'Equipment & Machinery Risks', title: 'Compressor explosion', controls: 'Regular inspection, pressure relief, proper use, maintenance, certification' },
  { category: 'Equipment & Machinery Risks', title: 'Battery charging hazards', controls: 'Ventilation, no ignition sources, eye wash, spill control, training, PPE' },
];

async function main() {
  console.log('🌱 Seeding risk templates...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const template of riskTemplates) {
    const category = categoryMap[template.category];
    if (!category) {
      console.warn(`⚠️  Unknown category: ${template.category}`);
      skipped++;
      continue;
    }

    try {
      // Try to find existing template
      const existing = await prisma.riskTemplate.findFirst({
        where: {
          category,
          title: template.title,
        },
      });

      if (existing) {
        await prisma.riskTemplate.update({
          where: { id: existing.id },
          data: {
            description: template.title,
            controls: template.controls,
            active: true,
          },
        });
        updated++;
      } else {
        await prisma.riskTemplate.create({
          data: {
            category,
            title: template.title,
            description: template.title,
            controls: template.controls,
            active: true,
          },
        });
        created++;
      }
    } catch (error) {
      console.error(`❌ Error processing "${template.title}":`, error.message);
      skipped++;
    }
  }

  console.log(`✅ Seeding complete:`);
  console.log(`   Created: ${created}`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${riskTemplates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding risks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

