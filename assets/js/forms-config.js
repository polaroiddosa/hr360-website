/* HR360 / Humanize HR Academy: every Google Form id, entry id and option text lives here.
   Plain JSON assigned to a window global (tools/build_pages.py and the checks read it too).

   HOW TO CONNECT A FORM
   1. Create the Google Form exactly as described in FORMS-SPEC.md (same questions, order, Required flags, option texts).
   2. formId: the long id in the form's public link, https://docs.google.com/forms/d/e/<formId>/viewform
   3. entry: for each question, the "entry.NNNNNNNN" name (use "Get pre-filled link" in Google Forms to read them).
   4. Replace every value that starts with PLACEHOLDER. While any value still starts with PLACEHOLDER the site does
      NOT pretend to send: it opens a prefilled WhatsApp message instead and says so.

   RULES: "required" here must equal "Required" in the Google Form. The option arrays below are the only place the
   option texts are written; the page renders the dropdowns from them AND posts them, so they always match. */
window.HR360_FORMS = {
  "minSecondsOnPage": 3,
  "options": {
    "services": [
      "ATS-Friendly Resume Preparation",
      "Academic Project Support",
      "Seminar and Presentation Support",
      "Assignment Support",
      "Tuition and Learning Support",
      "Courses",
      "Something else"
    ],
    "courses": [
      "HR Fundamentals",
      "Recruitment and Talent Acquisition",
      "Payroll and Compliance Basics",
      "HR Analytics with Excel",
      "Resume and Interview Skills",
      "Campus-to-Career Starter"
    ],
    "roles": ["Student", "Fresher", "Working professional"]
  },
  "forms": {
    "enquiry": {
      "formId": "PLACEHOLDER_ENQUIRY_FORM_ID",
      "submitLabel": "Send enquiry",
      "fields": [
        {"key": "name", "entry": "entry.PLACEHOLDER_ENQ_NAME", "label": "Full name", "type": "text", "required": true, "autocomplete": "name"},
        {"key": "phone", "entry": "entry.PLACEHOLDER_ENQ_PHONE", "label": "Phone or WhatsApp number", "type": "tel", "required": true, "autocomplete": "tel"},
        {"key": "email", "entry": "entry.PLACEHOLDER_ENQ_EMAIL", "label": "Email", "type": "email", "required": false, "autocomplete": "email"},
        {"key": "service", "entry": "entry.PLACEHOLDER_ENQ_SERVICE", "label": "Service of interest", "type": "select", "optionsFrom": "services", "required": true},
        {"key": "message", "entry": "entry.PLACEHOLDER_ENQ_MESSAGE", "label": "Message", "type": "textarea", "required": false}
      ]
    },
    "registration": {
      "formId": "PLACEHOLDER_REGISTRATION_FORM_ID",
      "submitLabel": "Register interest",
      "fields": [
        {"key": "name", "entry": "entry.PLACEHOLDER_REG_NAME", "label": "Full name", "type": "text", "required": true, "autocomplete": "name"},
        {"key": "phone", "entry": "entry.PLACEHOLDER_REG_PHONE", "label": "Phone or WhatsApp number", "type": "tel", "required": true, "autocomplete": "tel"},
        {"key": "email", "entry": "entry.PLACEHOLDER_REG_EMAIL", "label": "Email", "type": "email", "required": true, "autocomplete": "email"},
        {"key": "course", "entry": "entry.PLACEHOLDER_REG_COURSE", "label": "Course", "type": "select", "optionsFrom": "courses", "required": true},
        {"key": "role", "entry": "entry.PLACEHOLDER_REG_ROLE", "label": "I am a", "type": "select", "optionsFrom": "roles", "required": true},
        {"key": "message", "entry": "entry.PLACEHOLDER_REG_MESSAGE", "label": "Message", "type": "textarea", "required": false}
      ]
    }
  }
};
