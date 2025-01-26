document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const element = document.createElement('div');
        element.setAttribute("class", "element-div");
        element.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  read: true
              })
            })
            open_email(email.id, mailbox)
        });
        if (mailbox === "inbox") {
          if (email.read) {
            element.style.backgroundColor = "silver";
          }
        } else {
          element.style.backgroundColor = "white";
        }

        document.querySelector('#emails-view').append(element);

        const info = document.createElement('div');
        info.setAttribute("class", "info-div");
        element.append(info);

        const sender = document.createElement('div');
        sender.setAttribute("class", "sender-div");
        if (mailbox === "sent") {
          sender.innerHTML = email.recipients;
        } else {
          sender.innerHTML = email.sender;
        }
        info.append(sender);
        const subject = document.createElement('div');
        subject.setAttribute("class", "subject-div");
        subject.innerHTML = email.subject;
        info.append(subject);

        const timestamp = document.createElement('div');
        timestamp.setAttribute("class", "timestamp-div");
        timestamp.innerHTML = email.timestamp;
        element.append(timestamp);
                
        
      })
  });
}

function open_email(id, mailbox) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#email-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';

      document.querySelector('#email-view').innerHTML = '';

      const head = document.createElement('div');
      head.setAttribute("id", "emailHead-div");
      const address = document.createElement('div');
      address.innerHTML = "<strong>From: </strong>" + email.sender + "<br>" + "<strong>To: </strong>" + email.recipients + "<br>" + "<strong>Subject: </strong>" + email.subject + "<br>" + "<strong>Timestamp: </strong>" + email.timestamp;
      head.append(address);
      const button_div = document.createElement('div');
      button_div.setAttribute("id", "button-div");
      button_div.innerHTML = "";
      head.append(button_div);
      const button = document.createElement('BUTTON');
      button.setAttribute("class", "btn btn-sm btn-outline-primary");
      button.setAttribute("id", "button1");
      button.innerHTML = "Reply";
      button.addEventListener('click', function() {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#email-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';

        document.querySelector('#compose-recipients').value = email.sender;
        if (/^Re/.test(email.subject)) {
          document.querySelector('#compose-subject').value = email.subject;  
        } else {
          document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
        }
        document.querySelector('#compose-body').value = '\n \n' + 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + '\n' + email.body;
      })
      button_div.append(button);
      document.querySelector('#email-view').append(head);
      
      const button2 = document.createElement('BUTTON');
      button2.setAttribute("class", "btn btn-sm btn-outline-primary");
      button2.setAttribute("id", "button2");
      if (email.archived === false) {
        button2.innerHTML = "Archive";
        button2.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
          .then(() => {
            load_mailbox('inbox')
          })
        })
      } else {
        button2.innerHTML = "Unarchive";
        button2.addEventListener('click', function() {
          fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
          .then(() => {
            load_mailbox('inbox')
          })
        })
      }
      if (mailbox !== "sent") {
        button_div.append(button2);
      }
      
      document.querySelector('#email-view').append(document.createElement('hr'));

      const body = document.createElement('div');
      body.setAttribute("id", "emailBody-div");
      body.innerHTML = email.body
      body.innerHTML = body.innerHTML.replace(/\n/g, '<br>');
      document.querySelector('#email-view').append(body);
});

}

function send_email(event) {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(body);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent')
  });

  event.preventDefault();
}