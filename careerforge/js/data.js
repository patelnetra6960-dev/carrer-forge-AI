/* ============================================================
   CareerForge AI — shared data
   ============================================================ */

const DOMAINS = [
  { id: "uiux", name: "UI/UX Design", cat: "Design", icon: "🎨", desc: "Craft intuitive, human-centered digital experiences.",
    skills: ["Wireframing", "Prototyping", "User Research", "Visual Design"], tools: ["Figma", "Sketch", "Maze"],
    roles: ["Product Designer", "UX Researcher", "Interaction Designer"],
    fit: "you enjoy translating human needs into clear, usable interfaces." },
  { id: "aiml", name: "Artificial Intelligence & ML", cat: "Data", icon: "🧠", desc: "Build systems that learn from data and make predictions.",
    skills: ["Python", "Statistics", "Model Training", "Linear Algebra"], tools: ["PyTorch", "TensorFlow", "Jupyter"],
    roles: ["ML Engineer", "AI Researcher", "Applied Scientist"],
    fit: "you like solving logical, data-driven problems with measurable outcomes." },
  { id: "frontend", name: "Frontend Development", cat: "Engineering", icon: "🖥️", desc: "Build the interfaces people interact with directly.",
    skills: ["HTML/CSS", "JavaScript", "React", "Accessibility"], tools: ["VS Code", "Chrome DevTools", "Figma"],
    roles: ["Frontend Engineer", "UI Engineer"], fit: "you enjoy shaping how a product looks and feels to use." },
  { id: "backend", name: "Backend Development", cat: "Engineering", icon: "🗄️", desc: "Design the systems and logic that power applications.",
    skills: ["APIs", "Databases", "System Design", "Server Logic"], tools: ["Node.js", "PostgreSQL", "Docker"],
    roles: ["Backend Engineer", "Platform Engineer"], fit: "you enjoy building reliable systems behind the scenes." },
  { id: "fullstack", name: "Full Stack Development", cat: "Engineering", icon: "🧩", desc: "Work across the entire application stack.",
    skills: ["Frontend", "Backend", "Databases", "Deployment"], tools: ["React", "Node.js", "MongoDB"],
    roles: ["Full Stack Engineer", "Software Engineer"], fit: "you like owning a feature end to end." },
  { id: "datasci", name: "Data Science", cat: "Data", icon: "📊", desc: "Turn raw data into insight and decisions.",
    skills: ["Python/R", "Statistics", "Data Visualization", "SQL"], tools: ["Pandas", "Tableau", "Jupyter"],
    roles: ["Data Scientist", "Insights Analyst"], fit: "you enjoy finding patterns and telling stories with numbers." },
  { id: "cyber", name: "Cybersecurity", cat: "Infrastructure", icon: "🛡️", desc: "Protect systems, networks and data from threats.",
    skills: ["Network Security", "Threat Analysis", "Cryptography"], tools: ["Wireshark", "Kali Linux", "SIEM"],
    roles: ["Security Analyst", "Pentester"], fit: "you enjoy thinking like both defender and attacker." },
  { id: "cloud", name: "Cloud Computing", cat: "Infrastructure", icon: "☁️", desc: "Design and manage scalable cloud infrastructure.",
    skills: ["AWS/Azure/GCP", "Networking", "IaC"], tools: ["Terraform", "AWS Console", "Kubernetes"],
    roles: ["Cloud Engineer", "Solutions Architect"], fit: "you like systems-level, big-picture thinking." },
  { id: "mobile", name: "Mobile App Development", cat: "Engineering", icon: "📱", desc: "Build apps people carry in their pockets.",
    skills: ["Swift/Kotlin", "UI Design", "APIs"], tools: ["Xcode", "Android Studio", "Flutter"],
    roles: ["iOS Engineer", "Android Engineer"], fit: "you enjoy building focused, hands-on product experiences." },
  { id: "devops", name: "DevOps", cat: "Infrastructure", icon: "🔁", desc: "Automate and streamline software delivery.",
    skills: ["CI/CD", "Automation", "Monitoring"], tools: ["Jenkins", "Docker", "Kubernetes"],
    roles: ["DevOps Engineer", "SRE"], fit: "you like improving systems that already exist." },
  { id: "dataanalytics", name: "Data Analytics", cat: "Data", icon: "📈", desc: "Analyze business data to guide decisions.",
    skills: ["SQL", "Excel", "Dashboards", "Storytelling"], tools: ["Power BI", "Tableau", "Looker"],
    roles: ["Business Analyst", "Data Analyst"], fit: "you enjoy researching and explaining findings clearly." },
  { id: "dataeng", name: "Data Engineering", cat: "Data", icon: "🏗️", desc: "Build the pipelines that move and shape data.",
    skills: ["ETL", "SQL", "Distributed Systems"], tools: ["Spark", "Airflow", "Kafka"],
    roles: ["Data Engineer", "Platform Engineer"], fit: "you like building sturdy, invisible infrastructure." },
  { id: "pm", name: "Product Management", cat: "Business", icon: "🧭", desc: "Guide products from idea to launch.",
    skills: ["Prioritization", "Communication", "Strategy"], tools: ["Jira", "Notion", "Figma"],
    roles: ["Product Manager", "APM"], fit: "you enjoy connecting user needs to team execution." },
  { id: "game", name: "Game Development", cat: "Engineering", icon: "🎮", desc: "Create interactive worlds and experiences.",
    skills: ["C#/C++", "Physics", "Game Design"], tools: ["Unity", "Unreal Engine"],
    roles: ["Gameplay Engineer", "Game Designer"], fit: "you enjoy creative, open-ended problem solving." },
  { id: "embedded", name: "Embedded Systems", cat: "Engineering", icon: "🔌", desc: "Program hardware-close, resource-constrained systems.",
    skills: ["C", "Microcontrollers", "Circuits"], tools: ["Arduino", "STM32", "RTOS"],
    roles: ["Embedded Engineer", "Firmware Engineer"], fit: "you enjoy precise, logical, step-by-step problem solving." },
  { id: "robotics", name: "Robotics", cat: "Engineering", icon: "🤖", desc: "Design and program machines that act in the physical world.",
    skills: ["Control Systems", "C++/Python", "Sensors"], tools: ["ROS", "MATLAB", "Gazebo"],
    roles: ["Robotics Engineer", "Controls Engineer"], fit: "you enjoy building something tangible from scratch." },
  { id: "blockchain", name: "Blockchain Development", cat: "Engineering", icon: "⛓️", desc: "Build decentralized applications and protocols.",
    skills: ["Solidity", "Cryptography", "Smart Contracts"], tools: ["Hardhat", "Ethers.js", "Remix"],
    roles: ["Blockchain Engineer", "Smart Contract Dev"], fit: "you like continuous learning in a fast-moving space." },
  { id: "arvr", name: "AR/VR Development", cat: "Engineering", icon: "🕶️", desc: "Build immersive augmented and virtual experiences.",
    skills: ["Unity/Unreal", "3D Math", "UX for Spatial"], tools: ["Unity", "ARKit", "Blender"],
    roles: ["XR Developer", "3D Engineer"], fit: "you enjoy creative freedom and spatial thinking." },
  { id: "qa", name: "Quality Assurance & Testing", cat: "Engineering", icon: "✅", desc: "Ensure software works reliably before it ships.",
    skills: ["Test Design", "Automation", "Debugging"], tools: ["Selenium", "Postman", "Jest"],
    roles: ["QA Engineer", "SDET"], fit: "you enjoy structured, process-driven work with clear impact." },
  { id: "itsupport", name: "IT Support & Systems Administration", cat: "Infrastructure", icon: "🖧", desc: "Keep systems and users running smoothly.",
    skills: ["Troubleshooting", "OS Admin", "Networking Basics"], tools: ["Windows/Linux Server", "Active Directory"],
    roles: ["IT Support Specialist", "Sysadmin"], fit: "you enjoy explaining and teaching concepts to others." },
  { id: "network", name: "Network Engineering", cat: "Infrastructure", icon: "🌐", desc: "Design and maintain the networks systems run on.",
    skills: ["Routing", "Switching", "Protocols"], tools: ["Cisco IOS", "Wireshark", "GNS3"],
    roles: ["Network Engineer", "NOC Engineer"], fit: "you enjoy stability, structure and process-driven work." },
  { id: "busanalysis", name: "Business Analysis", cat: "Business", icon: "📋", desc: "Bridge business needs and technical solutions.",
    skills: ["Requirements Gathering", "Process Mapping", "Communication"], tools: ["Jira", "Visio", "Excel"],
    roles: ["Business Analyst", "Systems Analyst"], fit: "you enjoy people-centered, communication-heavy problem solving." },
  { id: "digitalmkt", name: "Digital Marketing (Tech)", cat: "Business", icon: "📣", desc: "Grow tech products through data-driven marketing.",
    skills: ["SEO", "Analytics", "Campaign Strategy"], tools: ["Google Analytics", "HubSpot", "Ahrefs"],
    roles: ["Growth Marketer", "Marketing Analyst"], fit: "you enjoy creative work measured by real-world impact." },
  { id: "iot", name: "Internet of Things (IoT)", cat: "Infrastructure", icon: "📡", desc: "Connect physical devices into smart networked systems.",
    skills: ["Embedded C", "Networking", "Cloud Integration"], tools: ["Raspberry Pi", "MQTT", "AWS IoT"],
    roles: ["IoT Engineer", "Embedded Systems Engineer"], fit: "you enjoy systems-level thinking that spans hardware and software." },
  { id: "swarch", name: "Software Architecture", cat: "Engineering", icon: "🏛️", desc: "Design the high-level structure of complex software systems.",
    skills: ["System Design", "Design Patterns", "Scalability"], tools: ["Draw.io", "UML", "Cloud Platforms"],
    roles: ["Software Architect", "Staff Engineer"], fit: "you enjoy seeing how the pieces fit together." },
];

const CATEGORIES = ["Design", "Engineering", "Data", "Infrastructure", "Business"];

const ASSESSMENT_QUESTIONS = [
  {
    q: "What kind of projects or activities excite you the most?",
    opts: [
      "Building visual designs, graphics, and user-friendly layouts",
      "Solving logical puzzles, working with data, and discovering patterns",
      "Building functional applications, websites, games, or software tools",
      "Managing cloud servers, networks, cybersecurity, or smart hardware devices"
    ]
  },
  {
    q: "When you encounter a real-world problem, how do you naturally approach it?",
    opts: [
      "Sketch visual ideas and think about how people will experience the solution",
      "Analyze facts and data to find evidence-based answers",
      "Break the problem into step-by-step logic and build a practical solution",
      "Look at the overall system architecture and how components connect together"
    ]
  },
  {
    q: "Which type of work environment makes you feel most motivated?",
    opts: [
      "Creative and design-driven, where aesthetics and usability matter",
      "Analytical and research-focused, where data insights drive decisions",
      "Engineering-focused, where you build functional software tools and features",
      "Systems and security-focused, where stability and infrastructure protection are key"
    ]
  },
  {
    q: "What kind of achievement would bring you the greatest sense of accomplishment?",
    opts: [
      "Creating a beautiful, intuitive app layout that users love to interact with",
      "Uncovering a key data trend or building an intelligent prediction model",
      "Building a smooth, fast, and reliable software feature from scratch",
      "Setting up a secure, automated server network that runs without interruption"
    ]
  },
  {
    q: "Which of the following topics are you most curious to learn about?",
    opts: [
      "User psychology, visual branding, Figma, and interface design",
      "Artificial intelligence, machine learning, data statistics, and trends",
      "Coding languages (HTML, JS, Python, Java) and web/mobile app development",
      "Cyber defense, cloud infrastructure, robotics, IoT devices, or network engineering"
    ]
  },
  {
    q: "How do you prefer to contribute when working in a group project?",
    opts: [
      "Focusing on user experience, layout presentation, and visual clarity",
      "Handling research, analyzing data, and organizing key findings",
      "Writing core functionality code and building the working prototype",
      "Managing project tools, deployment, security, and technical configuration"
    ]
  },
  {
    q: "When learning something completely new, what helps you understand it best?",
    opts: [
      "Visual diagrams, interactive UI demos, and design examples",
      "Real data examples, charts, case studies, and statistical breakdowns",
      "Hands-on coding exercises and building small sample projects",
      "Step-by-step system architecture guides and hardware/network maps"
    ]
  },
  {
    q: "Where do you see yourself making the biggest impact in your future career?",
    opts: [
      "Designing digital products that millions of users enjoy every day",
      "Unlocking data insights to guide smart business and AI innovation",
      "Engineering powerful software applications and digital solutions",
      "Building and securing robust cloud systems, networks, and smart hardware"
    ]
  },
  {
    q: "When working on a puzzle or game, what is your favorite part?",
    opts: [
      "Appreciating the visual graphics, themes, and user interfaces",
      "Keeping track of stats, scores, and finding optimal winning strategies",
      "Figuring out the mechanics and rules of how the game behaves",
      "Setting up the game board, server connection, or controller hardware controls"
    ]
  },
  {
    q: "If you were to write a tech blog post, what would you most likely write about?",
    opts: [
      "Web design trends, color matching, and digital user typography",
      "A data-driven analysis of sports statistics or market trends",
      "A simple step-by-step tutorial on how to code a new software feature",
      "How to configure a secure home network or safeguard your smart devices"
    ]
  },
  {
    q: "Which of these virtual technology events sounds most interesting to you?",
    opts: [
      "A creative showcase of new digital art, spatial design, and VR experiences",
      "A conference on Big Data analytics, predictions, and machine learning models",
      "A fast hackathon for building web and mobile software application prototypes",
      "A boot camp on cloud deployment, cyber defense networks, or internet-of-things devices"
    ]
  },
  {
    q: "When you use a popular app like Instagram or Spotify, what do you think about most?",
    opts: [
      "How clean, visual, and visually satisfying the user interface looks",
      "How the algorithm recommends posts or songs based on my search history",
      "How fast the buttons respond and the app transitions slide",
      "How they protect my password security and host servers globally"
    ]
  },
  {
    q: "If you had a free weekend to learn a tool, which would you pick?",
    opts: [
      "Figma or Adobe Illustrator for drawing vector wireframes",
      "Tableau or Excel for data charts, SQL queries, and analytics",
      "VS Code for writing core code scripts (like Python or JavaScript)",
      "AWS Console or Raspberry Pi setting for networks and cloud hosting"
    ]
  },
  {
    q: "What type of problem-solving gives you the most satisfaction?",
    opts: [
      "Polishing a layout alignment until it looks perfectly balanced and modern",
      "Spotting a trend in numbers and metrics that others completely missed",
      "Debugging a software script until the application runs without errors",
      "Securing a system network or setting up a database server that never fails"
    ]
  },
  {
    q: "Which career vision sounds most rewarding to you?",
    opts: [
      "Being the creative voice behind user experience and visual layouts",
      "Being the analytical brain that predicts patterns and models data science",
      "Being the builder who writes clean code to construct applications",
      "Being the network engineer who maintains servers, cloud hosting, and cyber security"
    ]
  }
];

/* ============================================================
   25 DOMAINS — 8 DOMAIN-SPECIFIC MCQS PER DOMAIN
   ============================================================ */
const DOMAIN_QUESTIONS = {
  uiux: [
    { q: "What is the primary goal of User-Centered Design (UCD)?", opts: ["Designing around the needs, behaviors, and constraints of real users", "Prioritizing business revenue above all", "Creating flashy animations for marketing", "Writing backend database schema"] },
    { q: "Which deliverable best represents a low-fidelity wireframe?", opts: ["Basic structural sketches or layout outlines without visual styling", "A fully clickable code prototype", "Final high-resolution brand asset", "Server side API documentation"] },
    { q: "What does Usability Testing evaluate?", opts: ["How easily and intuitively real users can complete tasks", "Database query performance", "CSS animation frame rates", "Server uptime SLA"] },
    { q: "In UX design, what is Information Architecture (IA)?", opts: ["Organizing and structuring content logically for easy navigation", "Selecting font colors and shadows", "Configuring cloud server instances", "Writing JavaScript unit tests"] },
    { q: "What is the purpose of a User Persona?", opts: ["A semi-fictional representation of a key user segment based on research", "A legal contract for clients", "A visual color palette guide", "An automated test script"] },
    { q: "Which contrast ratio standard ensures text readability for accessibility (WCAG AA)?", opts: ["Minimum 4.5:1 contrast ratio for normal text", "Equal foreground and background color", "1:1 contrast ratio", "No contrast requirement"] },
    { q: "What is a Figma Component used for?", opts: ["Creating reusable UI elements across designs", "Compiling React code", "Managing database backups", "Hosting live domains"] },
    { q: "What does the term 'Affordance' mean in UI design?", opts: ["Visual clues that indicate how an object should be used", "The cost of purchasing design software", "The speed of server response", "CSS grid properties"] }
  ],
  aiml: [
    { q: "What distinguishes Supervised Learning from Unsupervised Learning?", opts: ["Supervised learning uses labeled training data", "Supervised learning requires no training data", "Unsupervised learning requires target labels", "Supervised learning runs without algorithms"] },
    { q: "What is Overfitting in a machine learning model?", opts: ["Model performs well on training data but poorly on unseen test data", "Model cannot learn the training data at all", "Model trains too fast", "Model uses too little memory"] },
    { q: "Which activation function is widely used in deep neural networks to introduce non-linearity?", opts: ["ReLU (Rectified Linear Unit)", "Linear Pass", "Constant Zero", "Identity Function"] },
    { q: "What is the primary role of a Loss Function in neural networks?", opts: ["Quantifying the difference between predicted and actual outcomes", "Formatting dataset CSV columns", "Rendering UI graphics", "Managing network bandwidth"] },
    { q: "What technique is commonly used to prevent overfitting by penalizing large weights?", opts: ["Regularization (L1 / L2)", "Hard Reboot", "SQL Indexing", "Data Encryption"] },
    { q: "What does Backpropagation calculate in a neural network?", opts: ["Gradients of loss with respect to each model weight", "Database primary keys", "Network ping latency", "User interface click rates"] },
    { q: "Which metric is best suited for evaluating a highly imbalanced classification dataset?", opts: ["Precision, Recall, and F1-Score", "Simple Accuracy", "File Size", "Execution Time"] },
    { q: "What is Transfer Learning in Machine Learning?", opts: ["Reusing a pre-trained model on a new related task", "Moving data between hard drives", "Converting Python code to C++", "Deploying a model to AWS"] }
  ],
  frontend: [
    { q: "What is the primary purpose of the Virtual DOM in React?", opts: ["Minimizing actual DOM manipulation for fast rendering", "Storing user passwords securely", "Handling database queries", "Managing server routing"] },
    { q: "Which CSS layout module provides two-dimensional layout control (rows AND columns)?", opts: ["CSS Grid", "Flexbox (one-dimensional)", "Inline Block", "Absolute Positioning"] },
    { q: "What does semantic HTML mean?", opts: ["Using HTML elements according to their structural meaning (e.g. <nav>, <article>)", "Styling all tags with inline CSS", "Writing JavaScript inside HTML tags", "Using only <div> tags"] },
    { q: "What is the difference between let and const in modern JavaScript?", opts: ["const variables cannot be reassigned after initialization", "let cannot be changed", "const is function-scoped while let is global", "They are identical"] },
    { q: "What is the purpose of JavaScript Promises?", opts: ["Handling asynchronous operations cleanly without callback hell", "Creating CSS animations", "Styling forms", "Compressing image files"] },
    { q: "What does the box-sizing: border-box CSS property do?", opts: ["Includes padding and border within the element's total width and height", "Removes element borders", "Adds extra margin around boxes", "Forces full width"] },
    { q: "What is a single-page application (SPA)?", opts: ["A web app that updates dynamically without full page reloads", "A website with only 1 line of HTML", "A static PDF document", "A server-side PHP script"] },
    { q: "What is ARIA used for in web development?", opts: ["Enhancing web accessibility for screen readers and assistive tech", "Accelerating CSS animations", "Database query optimization", "Managing web fonts"] }
  ],
  backend: [
    { q: "What is a RESTful API baseline architectural constraint?", opts: ["Stateless communication between client and server", "Requires GraphQL queries", "Must use relational databases only", "Forces WebSocket connections"] },
    { q: "What is the purpose of database indexing?", opts: ["Accelerating data retrieval speed at the cost of extra storage", "Encrypting database passwords", "Creating user interfaces", "Running automated backups"] },
    { q: "Which HTTP status code signifies a resource was successfully created?", opts: ["201 Created", "200 OK", "404 Not Found", "500 Internal Server Error"] },
    { q: "What is Database Normalization?", opts: ["Structuring relational data to reduce redundancy and improve data integrity", "Deleting old log files", "Connecting frontend to backend", "Adding duplicate tables"] },
    { q: "What is Middleware in backend frameworks like Express.js?", opts: ["Functions that execute during the request-response cycle before reaching final routes", "A database engine", "A CSS preprocessor", "A frontend UI library"] },
    { q: "What is the main advantage of connection pooling in database management?", opts: ["Reusing active database connections to reduce connection overhead", "Encrypting data in transit", "Compressing JSON responses", "Creating automatic UI tables"] },
    { q: "What is JWT (JSON Web Token) commonly used for?", opts: ["Stateless authentication and secure information transmission between parties", "Styling web pages", "Managing CSS themes", "Parsing HTML forms"] },
    { q: "What is the difference between SQL and NoSQL databases?", opts: ["SQL uses structured relational tables; NoSQL uses flexible document/key-value schemas", "SQL cannot handle numbers", "NoSQL is only for HTML", "They are identical"] }
  ],
  fullstack: [
    { q: "What defines a Full Stack developer's primary role?", opts: ["Working across both client-facing UI and server/database architecture", "Only writing CSS stylesheets", "Managing physical server hardware", "Designing marketing graphics"] },
    { q: "What is CORS (Cross-Origin Resource Sharing)?", opts: ["A browser security mechanism restricting resource requests from different origins", "A database query language", "A CSS layout grid", "A JavaScript framework"] },
    { q: "In a MERN stack application, what does MERN stand for?", opts: ["MongoDB, Express.js, React, Node.js", "MySQL, Ember, Ruby, Nginx", "MariaDB, Elixir, Redis, Next.js", "MongoDB, Electron, Redux, Node.js"] },
    { q: "What is Server-Side Rendering (SSR) compared to Client-Side Rendering (CSR)?", opts: ["SSR generates HTML on the server before sending to the client", "CSR is slower for single pages", "SSR happens in the user browser", "SSR requires no server"] },
    { q: "What is the role of environment variables (.env files) in full stack projects?", opts: ["Storing configuration secrets and API keys safely outside source code", "Styling UI buttons", "Structuring database tables", "Running HTML validation"] },
    { q: "What is GraphQL's main advantage over traditional REST APIs?", opts: ["Clients can request exactly the specific data fields they need", "GraphQL requires no database", "GraphQL replaces JavaScript", "GraphQL runs without network calls"] },
    { q: "What is WebSockets used for in web applications?", opts: ["Bi-directional, real-time communication between client and server", "Downloading static images", "Formatting HTML forms", "Compiling TypeScript"] },
    { q: "What is continuous integration and continuous deployment (CI/CD)?", opts: ["Automating code testing, building, and release deployment pipelines", "Writing code without version control", "Manual file upload via FTP", "Designing wireframes"] }
  ],
  datasci: [
    { q: "What is the primary purpose of Exploratory Data Analysis (EDA)?", opts: ["Understanding data patterns, anomalies, and distributions before modeling", "Publishing final reports", "Writing production APIs", "Designing user login forms"] },
    { q: "Which Python library is the standard for dataframe manipulation and analysis?", opts: ["Pandas", "Flask", "React", "Django"] },
    { q: "What does the Central Limit Theorem state?", opts: ["Sample means tend toward a normal distribution as sample size increases", "All data is naturally uniform", "Sample size does not matter", "Errors decrease to zero"] },
    { q: "What is the difference between Correlation and Causation?", opts: ["Correlation shows relationship association; causation implies one causes the other", "They are exact synonyms", "Causation implies no relationship", "Correlation is only for numbers"] },
    { q: "What is a Confusion Matrix used for?", opts: ["Evaluating performance of a classification model (TP, FP, TN, FN)", "Solving linear equations", "Sorting database keys", "Formatting text strings"] },
    { q: "What is Feature Engineering?", opts: ["Transforming raw data features to improve machine learning model accuracy", "Designing physical computer chips", "Writing HTML frontend code", "Configuring cloud servers"] },
    { q: "What is P-value in statistical hypothesis testing?", opts: ["Probability of obtaining results at least as extreme as observed, assuming null hypothesis is true", "Percentage of accurate predictions", "Primary key value", "Python variable type"] },
    { q: "Which algorithm is commonly used for unsupervised clustering?", opts: ["K-Means Clustering", "Linear Regression", "Logistic Regression", "Decision Tree Classifier"] }
  ],
  cyber: [
    { q: "What are the three core principles of the CIA Triad in Cybersecurity?", opts: ["Confidentiality, Integrity, and Availability", "Control, Intelligence, and Authentication", "Centralization, Inspection, and Authorization", "Crypto, Inspection, and Access"] },
    { q: "What is a Phishing attack?", opts: ["Social engineering attack deceiving users into revealing sensitive credentials", "Hardware router failure", "Overclocking a CPU", "Database table cleanup"] },
    { q: "What is the difference between Symmetric and Asymmetric Encryption?", opts: ["Symmetric uses one shared key; Asymmetric uses a public and private key pair", "Asymmetric is faster", "Symmetric requires no key", "They use the same key mechanism"] },
    { q: "What is a SQL Injection (SQLi) vulnerability?", opts: ["Injecting malicious SQL commands through user inputs to manipulate database queries", "Overloading a server with traffic", "Stealing Wi-Fi passwords", "Creating duplicate user accounts"] },
    { q: "What is the purpose of a Firewall?", opts: ["Monitoring and filtering incoming and outgoing network traffic based on security rules", "Speeding up CPU clock speed", "Compressing database records", "Formatting website layouts"] },
    { q: "What is Two-Factor Authentication (2FA)?", opts: ["Requiring two distinct identity verification factors to grant access", "Using two passwords", "Logging in from two devices", "Using two different web browsers"] },
    { q: "What is Penetration Testing?", opts: ["Authorized simulated cyberattacks on a system to discover vulnerabilities", "Writing unit tests for code", "Upgrading physical servers", "Installing antivirus software"] },
    { q: "What is a Zero-Day Vulnerability?", opts: ["A software security flaw unknown to the vendor with zero days to patch before exploitation", "A bug fixed on day zero", "A password expiring in zero days", "A server backup schedule"] }
  ],
  cloud: [
    { q: "What is the primary model of Infrastructure as a Service (IaaS)?", opts: ["Providing virtualized computing resources over the internet (VMs, storage, networks)", "Providing ready-to-use software applications", "Providing physical datacenter ownership", "Providing local desktop software"] },
    { q: "What is Cloud Auto-Scaling?", opts: ["Automatically adjusting computing capacity based on real-time application load", "Resizing image files automatically", "Scaling font sizes on mobile screens", "Deleting old user accounts"] },
    { q: "What is the principle of Serverless Computing (e.g. AWS Lambda)?", opts: ["Executing code on-demand without managing server infrastructure directly", "Running code without any computers", "Offline desktop application execution", "Manual server configuration"] },
    { q: "What is Infrastructure as Code (IaC) using tools like Terraform?", opts: ["Managing and provisioning cloud infrastructure through machine-readable definition files", "Writing backend application logic", "Coding website templates", "Building mobile app interfaces"] },
    { q: "Which AWS service is designed for scalable object storage?", opts: ["Amazon S3", "Amazon EC2", "AWS Lambda", "Amazon RDS"] },
    { q: "What is a Cloud Region vs an Availability Zone?", opts: ["A Region is a geographic area; Availability Zones are isolated datacenters within that Region", "They are identical terms", "Availability Zones are larger than Regions", "Regions contain no datacenters"] },
    { q: "What is High Availability (HA) in cloud architecture?", opts: ["Ensuring systems remain operational and accessible with minimal downtime", "Running servers at maximum CPU usage", "Limiting access to high-tier users", "High network download speed only"] },
    { q: "What is a Load Balancer's function?", opts: ["Distributing incoming traffic evenly across multiple backend servers", "Compressing database queries", "Encrypting user passwords", "Hosting domain DNS records"] }
  ],
  mobile: [
    { q: "Which programming language is officially recommended by Google for modern Android development?", opts: ["Kotlin", "Swift", "PHP", "Ruby"] },
    { q: "What is Flutter?", opts: ["Google's open-source UI toolkit for building natively compiled multi-platform apps", "A database engine", "A mobile operating system", "An iOS compiler"] },
    { q: "What is the role of Xcode in iOS development?", opts: ["Apple's integrated development environment (IDE) for building iOS apps", "An Android emulator", "A cloud server provider", "A CSS layout engine"] },
    { q: "What is React Native?", opts: ["A framework for building mobile applications using React and JavaScript", "A database query language", "A mobile hardware component", "A Safari browser extension"] },
    { q: "What is the purpose of mobile App Lifecycle States (e.g. Active, Paused)?", opts: ["Managing resource allocation and state preserving as users switch apps", "Controlling battery charging speed", "Updating app store pricing", "Compressing app icon images"] },
    { q: "What is Deep Linking in mobile applications?", opts: ["Directing users to specific content inside an app using a URL", "Linking two physical mobile phones", "Connecting to deep web servers", "Installing app updates in background"] },
    { q: "What is Push Notification service used for?", opts: ["Sending timely alerts to user devices even when the app is inactive", "Updating app code remotely", "Debugging live crash logs", "Saving battery consumption"] },
    { q: "What is ANR (Application Not Responding) in Android?", opts: ["An error occurring when the main UI thread is blocked for too long", "A network disconnection error", "A missing database table", "An invalid app license key"] }
  ],
  devops: [
    { q: "What is the core philosophy of DevOps culture?", opts: ["Fostering collaboration between Development and Operations for faster, reliable delivery", "Separating developers and ops teams entirely", "Writing code without testing", "Managing physical datacenter power"] },
    { q: "What is Docker used for?", opts: ["Containerizing applications and their dependencies for consistent runtime environments", "Writing frontend React components", "Managing DNS domain registries", "Designing UI mockups"] },
    { q: "What is Kubernetes primarily used for?", opts: ["Orchestrating, scaling, and managing containerized applications", "Compiling C++ code", "Editing video files", "Managing database schemas manually"] },
    { q: "What does CI/CD stand for?", opts: ["Continuous Integration and Continuous Deployment/Delivery", "Code Inspection and Code Distribution", "Central Interface and Custom Design", "Computer Infrastructure and Cloud Data"] },
    { q: "What is the purpose of Git in software development?", opts: ["Distributed version control system for tracking source code changes", "Cloud hosting provider", "Database management system", "UI design software"] },
    { q: "What is Infrastructure Monitoring using tools like Prometheus/Grafana?", opts: ["Tracking system health, metrics, performance, and operational alerts", "Monitoring social media accounts", "Writing automated unit tests", "Building client website forms"] },
    { q: "What is a Canary Deployment strategy?", opts: ["Rolling out updates to a small sub-percentage of users before full deployment", "Deploying changes to all users simultaneously", "Canceling all active deployments", "Testing code only on developer machines"] },
    { q: "What is Configuration Management with tools like Ansible or Chef?", opts: ["Automating server setup, provisioning, and software configuration consistency", "Designing website stylesheets", "Managing domain registration", "Editing JSON configuration manually"] }
  ],
  dataanalytics: [
    { q: "Which SQL clause is used to aggregate data by categories?", opts: ["GROUP BY", "ORDER BY", "JOIN", "WHERE"] },
    { q: "What is the difference between a Dimension and a Measure in BI tools like Tableau?", opts: ["Dimensions are categorical attributes; Measures are quantitative numerical values", "They are identical", "Measures are text strings; Dimensions are sums", "Dimensions cannot be filtered"] },
    { q: "What does KPI stand for in business analytics?", opts: ["Key Performance Indicator", "Key Process Integration", "Knowledge Performance Index", "Kernel Program Interface"] },
    { q: "What is Data Cleaning (Data Wrangling)?", opts: ["Identifying and fixing corrupt, duplicate, or missing data points", "Formatting dashboard colors", "Exporting reports to PDF", "Creating database backups"] },
    { q: "What type of chart is best suited for showing data trends over time?", opts: ["Line Chart", "Pie Chart", "Scatter Plot", "Donut Chart"] },
    { q: "In SQL, what is the difference between INNER JOIN and LEFT JOIN?", opts: ["LEFT JOIN returns all records from left table and matched records from right", "INNER JOIN returns all records from both tables regardless of match", "LEFT JOIN deletes unmatched rows", "They produce identical results"] },
    { q: "What is Cohort Analysis?", opts: ["Studying the behavior of specific groups of users over time sharing common characteristics", "Counting total website pageviews", "Sorting numbers ascending", "Filtering single rows"] },
    { q: "What is Data Storytelling?", opts: ["Communicating data insights clearly using visuals, context, and actionable narrative", "Writing fictional stories about data", "Creating complex code comments", "Encrypting database reports"] }
  ],
  dataeng: [
    { q: "What does ETL stand for in Data Engineering?", opts: ["Extract, Transform, Load", "Execute, Test, Launch", "Evaluate, Transfer, Log", "Encrypt, Transport, Lock"] },
    { q: "What is Apache Airflow used for?", opts: ["Programmatically authoring, scheduling, and monitoring data pipelines (DAGs)", "Building frontend mobile applications", "Styling CSS dashboards", "Hosting domain names"] },
    { q: "What is Apache Kafka primarily used for?", opts: ["High-throughput distributed event streaming and real-time data pipelines", "Running SQL queries on local files", "Formatting HTML web pages", "Managing user login sessions"] },
    { q: "What is a Data Warehouse vs a Data Lake?", opts: ["Data Warehouse stores structured curated data; Data Lake stores raw structured & unstructured data", "They are identical", "Data Lakes only store text files", "Data Warehouses cannot run SQL"] },
    { q: "What is Apache Spark?", opts: ["A unified analytics engine for large-scale distributed data processing", "A CSS framework", "A web browser", "A mobile OS"] },
    { q: "What is Partitioning in big data storage systems?", opts: ["Splitting datasets into smaller manageable files/dirs based on key columns for query speed", "Deleting old log records", "Encrypting passwords", "Creating web page layouts"] },
    { q: "What is Data Schema Drift?", opts: ["Unexpected changes in incoming source data structure over time", "Moving servers to another region", "Backing up databases", "Formatting table columns"] },
    { q: "What is Data Lineage?", opts: ["Tracking data origins, transformations, and flow trajectory across systems", "Counting total rows in a table", "Formatting SQL queries", "Deleting obsolete databases"] }
  ],
  pm: [
    { q: "What is an MVP (Minimum Viable Product)?", opts: ["A version of a product with just enough features to validate assumptions with early users", "A fully polished final release", "A visual design prototype with no functionality", "A detailed financial report"] },
    { q: "What is the MoSCoW prioritization framework?", opts: ["Categorizing features into Must-have, Should-have, Could-have, and Won't-have", "A software architecture design", "A code testing framework", "A marketing campaign metric"] },
    { q: "What is Product-Market Fit (PMF)?", opts: ["When a product satisfies a strong market demand effectively", "When a product launches on time", "When a product spends its full budget", "When a design team finishes wireframes"] },
    { q: "What is a Product Roadmap?", opts: ["A strategic visual guide mapping product goals, priorities, and direction over time", "A list of bug tickets", "A legal privacy document", "A database architecture diagram"] },
    { q: "What is User Story mapping?", opts: ["Organizing user tasks into a grid to outline customer journey and release scope", "Writing bug reports", "Designing app icons", "Conducting code reviews"] },
    { q: "What does Churn Rate measure?", opts: ["The percentage of customers who stop using a product over a given timeframe", "The speed of server response", "The number of new signups per day", "The total code commits per week"] },
    { q: "What is A/B Testing in product management?", opts: ["Comparing two versions of a feature to see which performs better with real users", "Testing two different databases", "Testing code on two computers", "Conducting two interviews"] },
    { q: "What is the primary responsibility of a Product Manager during sprint planning?", opts: ["Clarifying requirement scope, user value, and prioritizing backlog items", "Writing the backend API code", "Designing CSS buttons", "Testing network bandwidth"] }
  ],
  game: [
    { q: "What is a Game Engine?", opts: ["A software framework providing core functionalities like physics, rendering, audio, and scripting", "A physical gaming console", "A graphics card driver", "A web server host"] },
    { q: "What is the main game loop cycle?", opts: ["Input processing -> Game state update -> Frame rendering", "Download -> Install -> Play", "Code -> Compile -> Ship", "Click -> Save -> Exit"] },
    { q: "What is the purpose of Raycasting in 3D game physics?", opts: ["Projecting an invisible line to detect geometry collisions or line-of-sight", "Playing background music", "Compiling shader code", "Saving player game scores"] },
    { q: "What is a Shader in game graphics?", opts: ["A program running on the GPU that calculates rendering effects for lighting and materials", "A game controller accessory", "A player character model", "A sound effect file"] },
    { q: "What is Delta Time (deltaTime) in game programming?", opts: ["The elapsed time between the current frame and previous frame for frame-rate independent movement", "The total gameplay time", "The time to download a game", "The server ping time"] },
    { q: "What is Unity's Prefab system?", opts: ["A reusable asset template allowing instance creation across scenes with synced properties", "A 3D modeling software", "A code version control", "A sound synthesizer"] },
    { q: "What is Rigging in 3D character animation?", opts: ["Creating a skeleton structure of bones and joints for a 3D model to enable animation", "Setting up game lighting", "Writing sound scripts", "Configuring game servers"] },
    { q: "What is Spatial Audio in game development?", opts: ["Simulating sound positioning, distance, and acoustics to match 3D environment depth", "Playing 2D background music", "Muting player microphones", "Recording voice logs"] }
  ],
  embedded: [
    { q: "What is a Microcontroller (MCU)?", opts: ["A compact integrated circuit containing a processor core, memory, and programmable I/O peripherals", "A high-end desktop GPU", "A cloud server cluster", "A web browser extension"] },
    { q: "What does GPIO stand for in hardware electronics?", opts: ["General Purpose Input/Output", "Global Processing System", "Graph Protocol Interface", "General Power Output"] },
    { q: "What is an RTOS (Real-Time Operating System)?", opts: ["An OS designed to process data and respond to events with precise deterministic timing constraints", "A web server operating system", "A mobile smartphone OS", "A graphic design software"] },
    { q: "What is the I2C protocol commonly used for?", opts: ["Serial communication between microcontrollers and low-speed peripheral sensors using two wires", "High-speed internet streaming", "Wireless Bluetooth audio", "Powering heavy motors"] },
    { q: "What is Interrupt Service Routine (ISR)?", opts: ["A hardware-triggered function that executes immediately when a specific event occurs", "A database query script", "A CSS animation handler", "A web server route"] },
    { q: "What is Pulse Width Modulation (PWM) used for?", opts: ["Controlling analog power levels (like motor speed or LED brightness) using digital signals", "Encrypting hardware memory", "Compressing firmware files", "Reading digital switches"] },
    { q: "What is an ADC (Analog-to-Digital Converter)?", opts: ["Converting continuous analog signals (like voltage from sensors) into digital values", "Converting digital signals to sound", "Increasing battery voltage", "Formatting code strings"] },
    { q: "What is a Watchdog Timer?", opts: ["A hardware timer that resets the microcontroller if software hangs or freezes", "A digital clock display", "A battery life indicator", "A network ping tester"] }
  ],
  robotics: [
    { q: "What is Kinematics in Robotics?", opts: ["The study of motion of robotic bodies without considering the forces causing the motion", "Programming web interfaces", "Measuring battery voltage", "Designing robot logos"] },
    { q: "What does ROS stand for in robotics development?", opts: ["Robot Operating System", "Realtime Optimization Service", "Remote Output Sensor", "Robotic Open Standard"] },
    { q: "What is Inverse Kinematics (IK) used for?", opts: ["Calculating required joint angles to place an end-effector at a desired 3D position", "Measuring motor temperature", "Rendering 2D UI maps", "Compressing robot camera video"] },
    { q: "What is SLAM in autonomous robotics?", opts: ["Simultaneous Localization and Mapping", "System Logic and Management", "Sensor Loading and Monitoring", "Signal Level Analysis Method"] },
    { q: "What is the function of a LiDAR sensor on an autonomous robot?", opts: ["Emitting laser pulses to measure distance and build precise 3D point cloud maps", "Measuring ambient temperature", "Capturing audio signals", "Reading RFID tags"] },
    { q: "What is a PID Controller (Proportional-Integral-Derivative)?", opts: ["A feedback control loop mechanism widely used to maintain precise target speed or position", "A battery management chip", "A CAD modeling tool", "A database table key"] },
    { q: "What is an Actuator in a robotic system?", opts: ["A motor or mechanism responsible for moving or controlling a robotic component", "A sensor that measures light", "A robot camera lens", "A microchip memory module"] },
    { q: "What is Odometry in mobile robotics?", opts: ["Estimating a robot's change in position over time using sensor motion data", "Measuring battery charge level", "Calculating computer processing speed", "Scanning QR codes"] }
  ],
  blockchain: [
    { q: "What is a Smart Contract?", opts: ["Self-executing code with terms directly written into immutable blockchain protocol", "A digital legal document signed on paper", "A web server SSL certificate", "A mobile app subscription"] },
    { q: "What is Proof of Work (PoW) vs Proof of Stake (PoS)?", opts: ["PoW uses computational solving; PoS uses staked cryptocurrency tokens to validate blocks", "PoS requires more electricity than PoW", "PoW does not use cryptography", "They are identical protocols"] },
    { q: "What is Solidity?", opts: ["An object-oriented programming language for writing smart contracts on Ethereum", "A database engine", "A CSS library", "An operating system"] },
    { q: "What is the primary characteristic of Blockchain Immutability?", opts: ["Once data is recorded in a block, it cannot be altered or deleted without consensus", "Data can be edited anytime by admins", "Data is erased every 24 hours", "Data is only stored locally"] },
    { q: "What is a Distributed Ledger?", opts: ["A consensus of replicated, shared, and synchronized digital data geographically spread", "A single centralized database server", "An Excel spreadsheet", "A local text file"] },
    { q: "What is Gas in the Ethereum network?", opts: ["A fee paid to execute operations and smart contracts on the network", "The physical fuel for servers", "A metric for internet speed", "The size of a crypto wallet"] },
    { q: "What is a Public Key vs Private Key in crypto wallets?", opts: ["Public key is your address to receive funds; Private key is secret key to authorize transactions", "Private key is shared with everyone", "Public key signs transactions", "They are identical strings"] },
    { q: "What is a Decentralized Application (dApp)?", opts: ["An application running on a P2P blockchain network rather than a single server", "A desktop software with no internet", "A standard PHP website", "A mobile game with offline mode"] }
  ],
  arvr: [
    { q: "What is the fundamental difference between Augmented Reality (AR) and Virtual Reality (VR)?", opts: ["AR overlays digital content onto real environment; VR replaces environment completely", "VR overlays graphics on real camera view", "AR requires full head occlusion goggles", "They are identical technologies"] },
    { q: "What is 6DoF (Six Degrees of Freedom) in spatial tracking?", opts: ["Tracking rotational movement (pitch, yaw, roll) AND translational movement (X, Y, Z)", "Tracking only eye movement", "Tracking 6 different users", "Tracking audio volume levels"] },
    { q: "What is Field of View (FOV) in VR headsets?", opts: ["The observable visual angular area visible to the user at any given moment", "The distance to the computer", "The refresh rate of the screen", "The volume range of headphones"] },
    { q: "What is Latency (Motion-to-Photon) in VR systems?", opts: ["The delay between user head movement and rendered display image update", "The speed of downloading VR apps", "The battery life of the headset", "The audio processing buffer"] },
    { q: "What is Spatial Anchoring in AR development?", opts: ["Pinning virtual 3D objects to precise physical locations in the real world environment", "Anchoring a web browser window", "Binding a sound file to a button", "Saving game high scores"] },
    { q: "What is Occlusion in Augmented Reality?", opts: ["Real-world objects naturally hiding/blocking virtual objects behind them", "Fading virtual objects to black", "Increasing screen brightness", "Tracking hand gestures"] },
    { q: "Which game engine is widely used for AR/VR development?", opts: ["Unity", "Excel", "Photoshop", "Node.js"] },
    { q: "What is Foveated Rendering?", opts: ["Rendering full resolution only where the user's eye is looking, reducing GPU load", "Rendering in 2D instead of 3D", "Fading screen edges", "Rendering only static images"] }
  ],
  qa: [
    { q: "What is the main goal of Software Quality Assurance (QA)?", opts: ["Ensuring software meets specified requirements and standards before deployment", "Writing marketing copy", "Designing company logos", "Managing payroll budgets"] },
    { q: "What is the difference between Black-box Testing and White-box Testing?", opts: ["Black-box tests functionality without internal code knowledge; White-box tests internal structure", "White-box tests with dark mode", "Black-box is only for mobile apps", "They are identical methods"] },
    { q: "What is Regression Testing?", opts: ["Re-testing software after changes to ensure existing features were not broken", "Testing software on old operating systems", "Writing initial unit tests", "Deleting old test cases"] },
    { q: "What is Automated Testing using tools like Selenium or Cypress?", opts: ["Using scripts to execute test suites automatically without manual clicking", "Writing code without testing", "Manual testing by human QA team", "Automating user registration"] },
    { q: "What is a Test Case?", opts: ["A documented set of inputs, execution conditions, and expected results for a specific scenario", "A bug report email", "A project timeline", "A code commit message"] },
    { q: "What is Boundary Value Analysis in test design?", opts: ["Testing values at extreme edges and boundaries of input ranges", "Testing random numbers", "Testing only average middle values", "Testing text fonts"] },
    { q: "What is Smoke Testing (Sanity Testing)?", opts: ["A quick preliminary check to ensure critical basic functions work before deep testing", "Testing hardware heat levels", "Stress testing under 1,000,000 requests", "Reviewing UI visual colors"] },
    { q: "What is the difference between Severity and Priority of a bug?", opts: ["Severity measures technical impact; Priority measures business urgency to fix", "They mean the exact same thing", "Priority measures technical impact", "Severity is assigned by users"] }
  ],
  itsupport: [
    { q: "What is Active Directory (AD) used for in corporate IT environments?", opts: ["Centralized domain management, identity authentication, and policy enforcement", "Designing company websites", "Editing video files", "Managing mobile app stores"] },
    { q: "What is the purpose of DHCP (Dynamic Host Configuration Protocol)?", opts: ["Automatically assigning IP addresses and network parameters to devices on a network", "Encrypting user passwords", "Hosting domain names", "Cleaning hard drive junk files"] },
    { q: "What is Remote Desktop Protocol (RDP) used for?", opts: ["Allowing IT admins to connect to and manage a computer over network remotely", "Streaming 4K movies", "Designing vector graphics", "Compiling Java code"] },
    { q: "What is a Help Desk Ticketing System?", opts: ["Software for logging, tracking, prioritizing, and resolving user technical issues", "An online event ticket seller", "A code version repository", "A social media scheduler"] },
    { q: "What is the purpose of OS Patch Management?", opts: ["Systematically installing software updates to fix bugs and security vulnerabilities", "Formatting hard drives", "Changing desktop wallpapers", "Adding new user avatars"] },
    { q: "What is a VPN (Virtual Private Network) in remote IT work?", opts: ["Establishing a secure encrypted tunnel for accessing corporate network remotely", "Speeding up local Wi-Fi", "Creating automatic file backups", "Designing presentation slides"] },
    { q: "What is System Imaging (e.g. Sysprep / Clonezilla)?", opts: ["Creating a standardized OS snapshot to quickly deploy identical OS setup to new PCs", "Editing profile photos", "Scanning documents to PDF", "Recording screen videos"] },
    { q: "What is the first step in troubleshooting a non-responsive computer device?", opts: ["Gathering problem symptoms, verifying basic connections, and checking error messages", "Replacing the motherboard immediately", "Reinstalling the OS", "Deleting all files"] }
  ],
  network: [
    { q: "What are the 7 layers of the OSI Network Model (from Layer 1 to Layer 7)?", opts: ["Physical, Data Link, Network, Transport, Session, Presentation, Application", "HTML, CSS, JS, API, DB, Server, Client", "Hardware, Wire, Router, Switch, IP, Port, App", "Local, Gateway, Mask, DNS, DHCP, SSL, HTTP"] },
    { q: "What is the function of a Router vs a Switch?", opts: ["Routers connect different networks (Layer 3); Switches connect devices within same network (Layer 2)", "Switches connect networks", "Routers only work wirelessly", "They perform identical functions"] },
    { q: "What is IPv4 vs IPv6?", opts: ["IPv4 uses 32-bit addresses (~4.3B max); IPv6 uses 128-bit addresses for vast capacity", "IPv6 is older than IPv4", "IPv4 uses hex format", "They have the exact same address space"] },
    { q: "What is Subnetting in networking?", opts: ["Dividing a IP network into smaller, efficient sub-networks for routing and security", "Formatting hard drive partitions", "Connecting Bluetooth devices", "Writing router firmware"] },
    { q: "What is DNS (Domain Name System)?", opts: ["Translating human-friendly domain names (example.com) into numeric IP addresses", "Assigning local IP addresses dynamically", "Encrypting web traffic", "Blocking malware downloads"] },
    { q: "What is Wireshark used for?", opts: ["Capturing and analyzing network packet traffic in real time", "Writing Python code", "Building websites", "Editing images"] },
    { q: "What is VLAN (Virtual Local Area Network)?", opts: ["Creating logically isolated networks on the same physical switch hardware", "A virtual private server host", "A wireless router brand", "A optical fiber cable type"] },
    { q: "What is BGP (Border Gateway Protocol)?", opts: ["The core routing protocol of the internet that exchanges routing info between Autonomous Systems", "A local LAN cable protocol", "A Wi-Fi password format", "A Bluetooth pairing standard"] }
  ],
  busanalysis: [
    { q: "What is the primary role of a Business Analyst (BA)?", opts: ["Understanding business needs, analyzing processes, and defining requirements for solutions", "Writing production C++ code", "Designing corporate logos", "Managing physical IT servers"] },
    { q: "What is a Requirements Traceability Matrix (RTM)?", opts: ["A document linking business requirements to technical deliverables and test cases", "A database schema diagram", "A financial tax document", "A social media schedule"] },
    { q: "What is a Use Case in business analysis?", opts: ["A detailed description of how a user interacts with a system to achieve a specific goal", "A legal lawsuit filing", "A marketing banner ad", "A code function signature"] },
    { q: "What is Gap Analysis?", opts: ["Comparing current state (As-Is) with target future state (To-Be) to identify steps needed", "Measuring gap between physical office desks", "Calculating network latency", "Formatting Excel tables"] },
    { q: "What is Stakeholder Analysis?", opts: ["Identifying key people impacted by a project and managing their expectations and influence", "Counting company stock shares", "Analyzing competitors' code", "Conducting code reviews"] },
    { q: "What is BPMN (Business Process Model and Notation)?", opts: ["A standardized graphical notation for modeling business workflows and processes", "A programming language", "A database system", "A financial audit tool"] },
    { q: "What is Functional vs Non-Functional Requirements?", opts: ["Functional specifies what system does; Non-Functional specifies performance/security quality", "Functional is optional", "Non-Functional is for developers only", "They mean the exact same thing"] },
    { q: "What is SWOT Analysis?", opts: ["Evaluating Strengths, Weaknesses, Opportunities, and Threats for strategic decision-making", "A software security test", "A network routing protocol", "A database query language"] }
  ],
  digitalmkt: [
    { q: "What is SEO (Search Engine Optimization)?", opts: ["Optimizing website content and structure to rank higher in organic search engine results", "Buying paid banner ads", "Sending mass marketing emails", "Designing mobile app icons"] },
    { q: "What does CTR stand for in digital marketing analytics?", opts: ["Click-Through Rate (Clicks divided by Impressions)", "Customer Total Revenue", "Cost To Reach", "Content Transfer Ratio"] },
    { q: "What is Conversion Rate Optimization (CRO)?", opts: ["Increasing the percentage of website visitors who complete a desired action (e.g. signup)", "Converting currency in checkout", "Translating website text", "Increasing site load speed only"] },
    { q: "What is CAC vs LTV in marketing strategy?", opts: ["CAC is Customer Acquisition Cost; LTV is Lifetime Value of a customer", "CAC is Company Asset Value", "LTV is Local Traffic Volume", "They are identical metrics"] },
    { q: "What is Google Analytics primarily used for?", opts: ["Tracking and reporting website traffic, user behavior, and campaign performance", "Designing website layouts", "Writing backend server code", "Managing domain DNS"] },
    { q: "What is Inbound Marketing vs Outbound Marketing?", opts: ["Inbound attracts customers through valuable content; Outbound pushes ads directly to audiences", "Outbound is cheaper", "Inbound is only for email", "They are identical"] },
    { q: "What is Retargeting (Remarketing)?", opts: ["Serving targeted ads to users who previously visited your website or app", "Changing company target audience", "Changing ad agency partners", "Deleting old marketing leads"] },
    { q: "What is Content Marketing?", opts: ["Creating and distributing relevant, valuable content to attract and engage a target audience", "Selling software source code", "Managing server infrastructure", "Writing internal emails"] }
  ],
  iot: [
    { q: "What defines an Internet of Things (IoT) ecosystem?", opts: ["A network of physical devices equipped with sensors and software connected to the internet", "A single desktop computer", "A cloud data warehouse only", "A mobile game app"] },
    { q: "What is MQTT protocol widely used for in IoT?", opts: ["Lightweight publish/subscribe messaging protocol for low-bandwidth, constrained IoT devices", "Streaming 4K video", "Hosting HTML websites", "Formatting Excel reports"] },
    { q: "What is Edge Computing in IoT architectures?", opts: ["Processing data near the device source before sending filtered data to central cloud", "Running code on browser edges", "Deleting data at network edge", "Using curved monitors"] },
    { q: "What is the role of Actuators in IoT devices?", opts: ["Converting electronic signals into physical actions (like opening a valve or turning a motor)", "Measuring room temperature", "Transmitting Wi-Fi packets", "Storing microchip code"] },
    { q: "Which low-power wireless protocol is specifically popular for IoT smart home automation?", opts: ["Zigbee / Z-Wave", "Standard 5GHz Wi-Fi", "Ethernet Cable", "Satellite Dish"] },
    { q: "What is an IoT Gateway?", opts: ["A device connecting local IoT sensor networks to external cloud servers and managing protocols", "A physical door lock", "A website login portal", "A database table index"] },
    { q: "What is Firmware in embedded IoT hardware?", opts: ["Low-level software programmed directly into hardware ROM/Flash memory", "A cloud web browser", "A mobile application UI", "A PDF document file"] },
    { q: "What is the biggest security challenge in IoT deployments?", opts: ["Insecure default credentials and unencrypted communication on massive numbers of devices", "High cost of Wi-Fi routers", "Large physical size of sensors", "Slow screen refresh rates"] }
  ],
  swarch: [
    { q: "What is the primary difference between Monolithic and Microservices Architecture?", opts: ["Monolith is a single unified application; Microservices are decoupled, independent services", "Microservices use no databases", "Monoliths run only on mobile", "They are identical"] },
    { q: "What is the Single Responsibility Principle (SRP) in software architecture?", opts: ["A class or module should have one, and only one, reason to change", "A system should have only one server", "A program should run in one single thread", "A function must take one parameter"] },
    { q: "What is Event-Driven Architecture (EDA)?", opts: ["A pattern where decoupled components communicate asynchronously by producing and handling events", "An app that only runs during calendar events", "A synchronous step-by-step loop", "A design tool UI"] },
    { q: "What is Technical Debt in software projects?", opts: ["The implied cost of extra rework caused by choosing an easy short-term solution now", "Money owed to cloud providers", "Unpaid software developer salaries", "Cost of purchasing laptops"] },
    { q: "What is Domain-Driven Design (DDD)?", opts: ["An architectural approach modeling software logic to match real-world business domain concepts", "Designing domain web addresses", "Building HTML templates", "Managing domain DNS records"] },
    { q: "What is the CAP Theorem in distributed systems?", opts: ["A system can guarantee at most two of: Consistency, Availability, and Partition Tolerance", "Code Always Performs", "Cloud Access Protocol", "Central Application Processing"] },
    { q: "What is a Circuit Breaker Pattern in distributed systems?", opts: ["Preventing repeated execution of an operation that's likely to fail, protecting system health", "Cutting power to server hardware", "Shutting down database backups", "Deleting failed user logins"] },
    { q: "What is Scalability (Horizontal vs Vertical)?", opts: ["Horizontal adds more server nodes; Vertical adds more power (CPU/RAM) to an existing server", "Vertical adds more nodes", "Horizontal increases monitor size", "They mean the exact same thing"] }
  ]
};

// Generic interview question bank (used for both HR + Technical practice, framed per domain)
const INTERVIEW_QUESTIONS = [
  { q: "You're given a task with an unclear requirement. What's your first step?",
    opts: ["Ask clarifying questions before starting", "Guess the requirement and start building", "Wait for someone else to clarify it", "Skip the task"], correct: 0,
    explain: "Clarifying scope early avoids wasted work and shows strong communication — a trait employers consistently value.",
    tip: "In interviews, narrate how you'd clarify ambiguity rather than just giving a final answer." },
  { q: "A teammate's code is blocking your progress. What do you do?",
    opts: ["Complain about it to your manager immediately", "Talk to them directly and offer to help", "Rewrite their code without telling them", "Wait silently until it's fixed"], correct: 1,
    explain: "Direct, collaborative communication resolves blockers faster and preserves team trust.",
    tip: "Interviewers listen for how you handle friction with peers, not just technical skill." },
  { q: "How would you explain a technical concept to a non-technical stakeholder?",
    opts: ["Use full technical jargon for precision", "Use an analogy tied to their goals", "Avoid the conversation entirely", "Send them a research paper"], correct: 1,
    explain: "Analogies grounded in the listener's context make technical ideas accessible without losing accuracy.",
    tip: "Practice explaining one project of yours in two ways: technical and non-technical." },
  { q: "You made a mistake that affected a deliverable. What's the best response?",
    opts: ["Hide it and hope no one notices", "Own it, fix it, and share what you learned", "Blame external factors", "Quit the task"], correct: 1,
    explain: "Ownership and transparency after mistakes build long-term credibility with teams and interviewers alike.",
    tip: "Have one real 'mistake and recovery' story ready — it's one of the most common interview prompts." },
  { q: "How do you prioritize when you have multiple deadlines?",
    opts: ["Work on whatever feels easiest first", "Assess impact and urgency, then sequence tasks", "Do everything at once", "Ask someone else to decide for you"], correct: 1,
    explain: "Structured prioritization (impact vs. urgency) is a repeatable way to make sound decisions under pressure.",
    tip: "Mention a specific framework (like impact/urgency) — it signals structured thinking." },
  { q: "What's a strong way to answer 'Tell me about yourself' in an interview?",
    opts: ["Recite your full resume line by line", "A short, relevant narrative tied to the role", "Talk only about hobbies", "Ask them to skip the question"], correct: 1,
    explain: "A focused narrative connecting your background to the role keeps the answer relevant and memorable.",
    tip: "Structure it as: where you started → what you built → why this role is the natural next step." },
  { q: "How should you approach a technical problem you've never seen before?",
    opts: ["Say you don't know and stop", "Think aloud, break it into smaller parts", "Guess silently until you get it right", "Ask for the answer directly"], correct: 1,
    explain: "Interviewers evaluate process as much as the final answer — thinking aloud shows how you reason.",
    tip: "It's fine not to know the answer immediately; showing your approach matters more." },
  { q: "Why is asking for feedback regularly valuable early in a career?",
    opts: ["It slows down your growth", "It accelerates learning and shows initiative", "It's only useful once a year", "It's unnecessary if you're confident"], correct: 1,
    explain: "Frequent, specific feedback loops compress the time it takes to build real skill.",
    tip: "Ask for feedback on specific things ('how was my structure?') rather than a general 'how did I do?'." },
];

// ---- Seed data for the Admin portal (mock cohort) ----
const ADMIN_STUDENTS = [
  { id: "S1042", name: "Aarav Mehta", enrollment: "21ENG1042", dept: "Computer Science", year: "3rd Year", domain: "Frontend Development", readiness: 82, points: 1240, attempts: 14, improvement: 21, cert: "Pending" },
  { id: "S1043", name: "Diya Kapoor", enrollment: "21ENG1043", dept: "Information Technology", year: "4th Year", domain: "UI/UX Design", readiness: 91, points: 1610, attempts: 19, improvement: 34, cert: "Approved" },
  { id: "S1044", name: "Rohan Iyer", enrollment: "22ENG1044", dept: "Computer Science", year: "2nd Year", domain: "Data Science", readiness: 58, points: 640, attempts: 6, improvement: 9, cert: "Not Eligible" },
  { id: "S1045", name: "Sanya Verma", enrollment: "21ENG1045", dept: "Electronics & Comm.", year: "3rd Year", domain: "Embedded Systems", readiness: 74, points: 980, attempts: 11, improvement: 17, cert: "Pending" },
  { id: "S1046", name: "Karthik Rao", enrollment: "20ENG1046", dept: "Computer Science", year: "4th Year", domain: "Backend Development", readiness: 88, points: 1520, attempts: 17, improvement: 28, cert: "Pending" },
  { id: "S1047", name: "Meera Nair", enrollment: "22ENG1047", dept: "Information Technology", year: "2nd Year", domain: "Cybersecurity", readiness: 45, points: 410, attempts: 4, improvement: 5, cert: "Not Eligible" },
  { id: "S1048", name: "Yash Patel", enrollment: "21ENG1048", dept: "Mechanical Engineering", year: "3rd Year", domain: "Robotics", readiness: 79, points: 1105, attempts: 13, improvement: 22, cert: "Pending" },
  { id: "S1049", name: "Ananya Reddy", enrollment: "20ENG1049", dept: "Computer Science", year: "4th Year", domain: "AI & Machine Learning", readiness: 95, points: 1880, attempts: 22, improvement: 40, cert: "Approved" },
  { id: "S1050", name: "Vivaan Shah", enrollment: "22ENG1050", dept: "Information Technology", year: "1st Year", domain: "Cloud Computing", readiness: 33, points: 210, attempts: 2, improvement: 3, cert: "Not Eligible" },
  { id: "S1051", name: "Ishita Joshi", enrollment: "21ENG1051", dept: "Computer Science", year: "3rd Year", domain: "Product Management", readiness: 71, points: 890, attempts: 10, improvement: 16, cert: "Rejected" },
  { id: "S1052", name: "Arjun Menon", enrollment: "20ENG1052", dept: "Electronics & Comm.", year: "4th Year", domain: "IoT", readiness: 84, points: 1370, attempts: 15, improvement: 25, cert: "Pending" },
  { id: "S1053", name: "Kavya Pillai", enrollment: "22ENG1053", dept: "Computer Science", year: "2nd Year", domain: "Data Analytics", readiness: 62, points: 720, attempts: 8, improvement: 12, cert: "Not Eligible" },
];

if (typeof module !== "undefined") {
  module.exports = { DOMAINS, CATEGORIES, ASSESSMENT_QUESTIONS, INTERVIEW_QUESTIONS, ADMIN_STUDENTS };
}
