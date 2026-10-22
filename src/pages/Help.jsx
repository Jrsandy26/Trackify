import React, { useState } from 'react';

const faqData = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I create a new project?',
        a: 'Go to the Dashboard page and click the "Add New" button in the Projects section. Enter the project name and due date, then click "Add" to create your project.'
      },
      {
        q: 'How do I add team members?',
        a: 'Navigate to the Team page and click "Invite Member". Fill in their name, email, role, and department, then send the invitation.'
      },
      {
        q: 'How do I create tasks?',
        a: 'Go to the Tasks page and click "New Task" at the top. Fill in the task details including title, description, priority, assignee, and due date.'
      }
    ]
  },
  {
    category: 'Task Management',
    items: [
      {
        q: 'How do I move tasks between columns?',
        a: 'Simply drag and drop task cards between columns (To Do, In Progress, In Review, Done). On mobile devices, you can long-press and drag the card to move it.'
      },
      {
        q: 'How do I filter tasks?',
        a: 'Use the filter buttons at the top of the Tasks page to filter by: All Tasks, My Tasks, High Priority, or Due This Week.'
      },
      {
        q: 'Can I assign tasks to team members?',
        a: 'Yes! When creating a new task, select an assignee from the dropdown. You can also go to Team > Profile and use the "Assign Task" button directly.'
      }
    ]
  },
  {
    category: 'Calendar & Analytics',
    items: [
      {
        q: 'How do I switch between month and week view?',
        a: 'On the Calendar page, use the "Month" and "Week" toggle buttons at the top right to switch between views.'
      },
      {
        q: 'What metrics are tracked in Analytics?',
        a: 'Analytics tracks: Tasks Completed, On-Time Delivery rate, Average Cycle Time, Throughput (tasks per day), Time distribution by project, Activity trends, and Top Contributors.'
      },
      {
        q: 'Can I customize the week start day?',
        a: 'Yes! Go to Settings > Appearance and choose whether your week starts on Sunday or Monday. This affects the Calendar view.'
      }
    ]
  },
  {
    category: 'Settings & Customization',
    items: [
      {
        q: 'How do I change the theme?',
        a: 'Go to Settings > Appearance and select either Light or Dark theme. The change is applied immediately.'
      },
      {
        q: 'Can I change the accent color?',
        a: 'Yes! In Settings > Appearance, you can choose from 8 different accent colors to personalize your workspace.'
      },
      {
        q: 'How do I update my profile?',
        a: 'Navigate to Settings > Profile to update your name, email, role, timezone, and bio. Click "Save Changes" to apply.'
      }
    ]
  }
];

const shortcuts = [
  { keys: ['Ctrl', 'K'], action: 'Quick Search' },
  { keys: ['Ctrl', 'N'], action: 'New Task' },
  { keys: ['Ctrl', 'Shift', 'P'], action: 'New Project' },
  { keys: ['Ctrl', 'B'], action: 'Toggle Sidebar' },
  { keys: ['Ctrl', ','], action: 'Open Settings' },
];

export default function Help() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  const filteredFaq = searchQuery
    ? faqData.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item => item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : faqData;

  return (
    <div className="help-page">
      <div className="page-header">
        <div>
          <h1>Help Center</h1>
          <p className="page-subtitle">Find answers to common questions and learn how to use Trackify</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="help-quick-links">
        {[
          { icon: '📖', title: 'Documentation', desc: 'Browse detailed guides and tutorials' },
          { icon: '💬', title: 'Support', desc: 'Contact our support team for help' },
          { icon: '🎥', title: 'Video Tutorials', desc: 'Watch step-by-step video guides' },
          { icon: '🔄', title: 'What\'s New', desc: 'Check out the latest features and updates' },
        ].map((link, i) => (
          <div key={i} className="help-link-card">
            <span className="help-link-icon">{link.icon}</span>
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="help-search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder="Search for help topics..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="help-content-grid">
        {/* FAQ */}
        <div className="help-faq">
          <h2>Frequently Asked Questions</h2>
          {filteredFaq.map((category, ci) => (
            <div key={ci} className="faq-category">
              <h3 className="faq-category-title">{category.category}</h3>
              {category.items.map((item, qi) => {
                const id = `${ci}-${qi}`;
                return (
                  <div key={id} className={`faq-item ${openFaq === id ? 'open' : ''}`}>
                    <button className="faq-question" onClick={() => toggleFaq(id)}>
                      <span>{item.q}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ transform: openFaq === id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {openFaq === id && (
                      <div className="faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="help-shortcuts">
          <h2>Keyboard Shortcuts</h2>
          <div className="shortcuts-list">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="shortcut-item">
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, ki) => (
                    <React.Fragment key={ki}>
                      <kbd>{key}</kbd>
                      {ki < shortcut.keys.length - 1 && <span>+</span>}
                    </React.Fragment>
                  ))}
                </div>
                <span className="shortcut-action">{shortcut.action}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="help-contact">
            <h3>Need More Help?</h3>
            <p>Our support team is here to help you 24/7.</p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
