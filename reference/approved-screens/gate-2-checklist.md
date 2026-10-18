# Gate 2: click through every screen

For Azhar and Vijayalakshmi. Do each step on a phone and on a laptop, and tick both boxes.

App: https://staging.sightline.zarnik.com

## Before you start

- **Switch role with the review bar.** Every app screen has a grey bar at the top: "Review mode, sample data, not signed in. View as". Open the list and pick a role, for example "Hotel Manager: Priya Menon". If the new role cannot open the page you are on, the app takes you to that role's first page. The browser remembers your last role.
- **Switch hotel** with the hotel button in the header. People with one hotel see only the hotel name.
- **Menu.** On a laptop the menu is on the left. On a phone it is the bar at the bottom; anything after the first four items is under More.
- **Changes reset.** Reloading the page undoes changes to audits, people and audit templates. Fix changes and comments last until you close the browser tab.
- **Nothing real is sent.** No emails, no files uploaded, no PDFs made. All data is sample data. In the sample, today is 3 October 2026.
- **Who you are in each role:** Admin Meera Nair (all 3 hotels), Auditor Rohan Iyer (all 3 hotels), Group Head Anil Varghese (Harbour View Hotel and Palm Court Inn), Hotel Manager Priya Menon (Harbour View Hotel), Department Head Latha Krishnan (Harbour View Hotel), Staff Asha Kumari (Harbour View Hotel).

## Admin

Pick "Admin: Meera Nair" in the review bar.

**Menu should show:** Dashboard, All my hotels, Audits, Fixes, Reports, Masters, Users, Profile. On a phone, Reports, Masters, Users and Profile are under More.

1. **Do:** Open https://staging.sightline.zarnik.com/dashboard
   **You should see:** Dashboard for the current hotel with Property score, Last audit, Open fixes, Red flags in last audit and Audits not submitted. Buttons include Start audit, View fixes, Latest report, Compare hotels and All audits.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/hotels
   **You should see:** All my hotels: Harbour View Hotel, Palm Court Inn and Cedar Ridge Resort ranked by score, with search and filters. Below, a "Hotel settings for ..." button for each hotel.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** Open https://staging.sightline.zarnik.com/hotels/01930000-0002-7000-8000-000000000003/settings
   **You should see:** Hotel settings for Cedar Ridge Resort, read only, with an "Edit in Masters" button.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Open https://staging.sightline.zarnik.com/audits/01930000-0014-7000-8000-00000000000b
   **You should see:** Ops & Quality, May 2026 at Cedar Ridge Resort. Property score 50, a red alert "1 red flag" naming the extinguishers item, and "The property score is capped at 50."
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Open https://staging.sightline.zarnik.com/reports?tab=compare
   **You should see:** Reports with three tabs: Audit reports, History, Compare. Compare ranks the hotels, with Open fixes and Red flags.
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/masters then tap Draft items, Audit templates and Hotel settings in the row of links under the title.
   **You should see:** Library with a Show list (Items, Departments, Sections, SOPs and more), search and filters. Draft items lists items waiting for approval with Approve, Edit and Keep for one hotel. Hotel settings can be changed.
   - [ ] Phone
   - [ ] Laptop
7. **Do:** Open https://staging.sightline.zarnik.com/masters/templates/01930000-000d-7000-8000-000000000001 and tap Edit audit template.
   **You should see:** Message "Draft version created. The published version does not change." The heading changes to "Version 2, draft" and a Draft note explains changes reach new audits only after you publish.
   - [ ] Phone
   - [ ] Laptop
8. **Do:** Change the weight of one section, then tap Publish version 2, then Publish.
   **You should see:** A dialog "Publish version 2" before you confirm. After: message "Published version 2" and heading "Version 2, published, in use". Version 1 now shows "Published earlier".
   - [ ] Phone
   - [ ] Laptop
9. **Do:** Open https://staging.sightline.zarnik.com/users and tap Invite person.
   **You should see:** Everyone with access, with search and filters. The invite form offers every role (Admin, Auditor, Group Head, Hotel Manager, Department Head, Staff). Access expiry starts at 90 days.
   - [ ] Phone
   - [ ] Laptop
10. **Do:** Open https://staging.sightline.zarnik.com/users/01930000-0003-7000-8000-000000000001 (Meera Nair) and try to pick a different access expiry.
    **You should see:** Access expiry is No expiry. Every other option is greyed out, with the note "Meera Nair is the only Admin with No expiry. At least one Admin always has No expiry, so the app can never lock everyone out."
    - [ ] Phone
    - [ ] Laptop
11. **Do:** Open https://staging.sightline.zarnik.com/users/01930000-0003-7000-8000-00000000000c (Biju Mathew) and tap Renew access.
    **You should see:** A red "Access expired" note before. After: message "Access renewed for Biju Mathew".
    - [ ] Phone
    - [ ] Laptop
12. **Do:** Open https://staging.sightline.zarnik.com/profile then https://staging.sightline.zarnik.com/profile/email
    **You should see:** Profile, Password, Your roles and Access. Email reminders has one switch for fix due and overdue reminders, and a list of emails that are always sent.
    - [ ] Phone
    - [ ] Laptop

## Auditor

Pick "Auditor: Rohan Iyer" in the review bar.

**Menu should show:** Dashboard, All my hotels, Audits, Profile. No Fixes, Reports, Masters or Users.

1. **Do:** Pick Harbour View Hotel in the hotel button, then open https://staging.sightline.zarnik.com/dashboard
   **You should see:** Buttons Continue audit, Start audit and All audits. No Open fixes box and no fixes table.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/audits
   **You should see:** Harbour View Hotel audits, including Ops & Quality, October 2026 marked In progress, and a Start audit button.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** Open https://staging.sightline.zarnik.com/audits/local-audit-1/capture
   **You should see:** The capture screen opens at section 3, Rooms & Housekeeping. A sticky header shows "7 of 34 answered", "All synced" and a Review button.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** On "Cleanliness and smell", tap 5 once.
   **You should see:** One tap is enough. The 5 turns colour, the line "5, Excellent" appears and the answered count goes up by one. Nothing to type.
   - [ ] Phone
   - [ ] Laptop
5. **Do:** On "Bed and linen", tap 1.
   **You should see:** An Observation box appears marked required, with "Add an Observation for a score of 2 or below, or No." The message goes when you type an Observation.
   - [ ] Phone
   - [ ] Laptop
6. **Do:** On "Door, lock and safety notice" (marked Critical), tap 0.
   **You should see:** A Red flag badge, a red border on the card, and "Red flag. The property score is capped at 50."
   - [ ] Phone
   - [ ] Laptop
7. **Do:** Tap More details on any item.
   **You should see:** Responded by (name and role), Team response, Reason (one tap choices such as No SOP, Not trained) and Recommendation.
   - [ ] Phone
   - [ ] Laptop
8. **Do:** Turn on airplane mode (laptop: turn off Wi-Fi). Score one more item, then tap Review.
   **You should see:** "Offline. 1 item not synced" in the header and "Not synced" on the item. In Review, the Submit card says "You cannot submit yet" and lists "Wait for 1 item to sync. Connect to the internet if offline." Submit audit is greyed out.
   - [ ] Phone
   - [ ] Laptop
9. **Do:** Turn airplane mode off (or Wi-Fi back on) and wait a moment.
   **You should see:** "All synced". The sync line leaves the list; only unanswered items still block submit.
   - [ ] Phone
   - [ ] Laptop
10. **Do:** In capture, tap Add item.
    **You should see:** Two tabs: From library and New Draft item. From library says "Every library item is already in this audit." New Draft item asks for Department, Item name, Question and score scale.
    - [ ] Phone
    - [ ] Laptop
11. **Do:** Open https://staging.sightline.zarnik.com/audits/new, choose Hotel: Harbour View Hotel, Audit template: Blank audit, then Start audit.
    **You should see:** Capture opens with "No items in this audit" and an Add item button.
    - [ ] Phone
    - [ ] Laptop
12. **Do:** Tap Add item, From library, then Add next to "Approach road and signage". Tap 4 on it, then Review, Submit audit, Submit audit.
    **You should see:** The item appears in Arrival & Exterior. Review says every item is answered and synced. A dialog "Submit this audit?" asks to confirm. After, the audit page shows Submitted and a Property score.
    - [ ] Phone
    - [ ] Laptop
13. **Do:** Open https://staging.sightline.zarnik.com/audits/01930000-0014-7000-8000-00000000000d/report then tap Full report.
    **You should see:** Summary for Ops & Quality, July 2026 at Harbour View Hotel, and an Export PDF button. Full report lists findings with Observation, Responded by, Team response, Reason and Recommendation.
    - [ ] Phone
    - [ ] Laptop
14. **Do:** Open https://staging.sightline.zarnik.com/fixes
    **You should see:** "Auditor cannot open this page. Use the menu to choose another page."
    - [ ] Phone
    - [ ] Laptop

## Group Head

Pick "Group Head: Anil Varghese" in the review bar.

**Menu should show:** Dashboard, All my hotels, Audits, Fixes, Reports, Profile. No Masters or Users.

1. **Do:** Open https://staging.sightline.zarnik.com/dashboard and open the hotel button.
   **You should see:** Only Harbour View Hotel and Palm Court Inn, plus All my hotels. Buttons include Compare hotels and Hotel settings. No Start audit.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/hotels
   **You should see:** Two hotels ranked side by side with latest score, change, open fixes and red flags.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** Open https://staging.sightline.zarnik.com/reports?tab=compare and tap Open latest report on one hotel.
   **You should see:** Compare tab ranks the two hotels. The link opens that hotel's latest audit report.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Open https://staging.sightline.zarnik.com/fixes/01930000-0019-7000-8000-000000000017
   **You should see:** Fix "Check-out and billing accuracy". The Assignment card has Assigned to, Due date and Save assignment. The Status card has no Mark in progress or Mark resolved buttons. You can add a comment.
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Open https://staging.sightline.zarnik.com/audits/01930000-0014-7000-8000-000000000011 (a Cedar Ridge Resort audit, not in this group).
   **You should see:** "This audit does not exist, or you cannot open it."
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/hotels/01930000-0002-7000-8000-000000000001/settings
   **You should see:** Hotel settings for Harbour View Hotel, read only: "Only Admin can change them." No Edit in Masters button.
   - [ ] Phone
   - [ ] Laptop

## Hotel Manager

Pick "Hotel Manager: Priya Menon" in the review bar.

**Menu should show:** Dashboard, Audits, Fixes, Reports, Users, Profile. No All my hotels (one hotel only). On a phone, Users and Profile are under More.

1. **Do:** Open https://staging.sightline.zarnik.com/dashboard
   **You should see:** Harbour View Hotel shown as plain text, no hotel list. Buttons View fixes, Latest report, Invite staff, Hotel settings, All audits. Property score is shown.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/audits
   **You should see:** Only submitted audits (January, April, July 2026). No Start audit button and no in progress audit.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** Open https://staging.sightline.zarnik.com/fixes
   **You should see:** Counts for Open, In progress, Overdue, Unassigned, then the Harbour View Hotel fixes with search and filters.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Open https://staging.sightline.zarnik.com/fixes/01930000-0019-7000-8000-000000000017. In Assignment pick "Latha Krishnan, Department Head", change the due date and tap Save assignment.
   **You should see:** Message "Assigned to Latha Krishnan, due ...". Assigned to and Due date update, and History adds the change.
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Assign the same fix back to "Asha Kumari, Staff" and save, so the Staff steps below work.
   **You should see:** Assigned to shows Asha Kumari.
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/users and tap Invite staff. Enter a name and email, keep 90 days, tap Send invite.
   **You should see:** The list shows only Priya Menon, Latha Krishnan and Asha Kumari. The form is titled "Invite staff to Harbour View Hotel" and has no role choice. After: message "Invite saved for ... Sample data, so no email is sent." and the person appears as Invited.
   - [ ] Phone
   - [ ] Laptop
7. **Do:** Open https://staging.sightline.zarnik.com/hotels/01930000-0002-7000-8000-000000000002/settings (Palm Court Inn).
   **You should see:** "This hotel is not one of yours, or it does not exist."
   - [ ] Phone
   - [ ] Laptop
8. **Do:** Open https://staging.sightline.zarnik.com/reports
   **You should see:** Tabs Audit reports and History only. No Compare tab.
   - [ ] Phone
   - [ ] Laptop

## Department Head

Pick "Department Head: Latha Krishnan" in the review bar.

**Menu should show:** Dashboard, Audits, Fixes, Reports, Profile. On a phone, Profile is under More.

1. **Do:** Open https://staging.sightline.zarnik.com/dashboard
   **You should see:** "Your departments: Arrival & Exterior, Rooms & Housekeeping, Public Areas & Facilities". No Property score box. "Your department scores" lists only those three.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/audits
   **You should see:** Audits with Date and Status but no Score column.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** Open https://staging.sightline.zarnik.com/audits/01930000-0014-7000-8000-00000000000d
   **You should see:** No Property score. "Your department scores" shows the three departments. The Department filter lists only those three.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Open https://staging.sightline.zarnik.com/audits/01930000-0014-7000-8000-00000000000d/report
   **You should see:** The button reads "Export your departments as PDF". No property score anywhere in the report.
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Open https://staging.sightline.zarnik.com/fixes
   **You should see:** Only the "Bed and linen" fix (Rooms & Housekeeping). No Front Office or Engineering fixes.
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/fixes/01930000-0019-7000-8000-000000000017 (a Front Office fix).
   **You should see:** "Department Head cannot open this fix."
   - [ ] Phone
   - [ ] Laptop
7. **Do:** Open https://staging.sightline.zarnik.com/reports?tab=history
   **You should see:** No Compare tab. History says "You see your departments only." and shows "Your department trends".
   - [ ] Phone
   - [ ] Laptop

## Staff

Pick "Staff: Asha Kumari" in the review bar.

**Menu should show:** Fixes and Profile only.

1. **Do:** Open https://staging.sightline.zarnik.com/fixes
   **You should see:** "Harbour View Hotel. Fixes assigned to you." Two fixes: Check-out and billing accuracy (Open) and Preventive maintenance records (In progress). No count boxes and no Assigned to filter.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/fixes/01930000-0019-7000-8000-000000000017
   **You should see:** The finding (Observation, Responded by, Team response, Reason, Recommendation, SOP), Status with Mark in progress and Mark resolved, and Assignment as plain text with no form.
   - [ ] Phone
   - [ ] Laptop
3. **Do:** In Comments, type a comment, tap Attach photos or files and pick or take a photo, then tap Add comment.
   **You should see:** The photo name and size listed before you send. After: message "Comment added" and your comment under Asha Kumari, Staff, with the photo listed.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Tap Mark in progress.
   **You should see:** Message "Status changed to In progress". Status shows In progress, only Mark resolved is left, and History adds "Open to In progress".
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Open https://staging.sightline.zarnik.com/fixes/01930000-0019-7000-8000-000000000001 (a fix assigned to someone else).
   **You should see:** "Staff cannot open this fix."
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/dashboard
   **You should see:** "Staff cannot open this page. Use the menu to choose another page."
   - [ ] Phone
   - [ ] Laptop

## Sign in screens

Do these once. They do not change the role in the review bar.

1. **Do:** Open https://staging.sightline.zarnik.com/login, pick "Priya Menon, Hotel Manager, Harbour View Hotel" under Sample accounts, tap Sign in.
   **You should see:** Email and password fill in. Message "Signed in as Priya Menon" and the Dashboard opens.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** On https://staging.sightline.zarnik.com/login, pick a sample account, change the password, tap Sign in.
   **You should see:** "Could not sign in. The email or password is wrong. Try again."
   - [ ] Phone
   - [ ] Laptop
3. **Do:** On https://staging.sightline.zarnik.com/login, pick "Biju Mathew ... (access expired)" and tap Sign in.
   **You should see:** "Your access has expired" with Back to sign in.
   - [ ] Phone
   - [ ] Laptop
4. **Do:** Open https://staging.sightline.zarnik.com/magic-link, enter any email, tap Email me a sign in link.
   **You should see:** "Check your email" with "We sent a sign in link to" your email.
   - [ ] Phone
   - [ ] Laptop
5. **Do:** Open https://staging.sightline.zarnik.com/forgot-password, enter any email, tap Send reset link, then Open the sample reset link.
   **You should see:** The same "Check your email" message for any email. The link opens "Set a new password". Enter a password of at least 10 characters twice: "Password changed".
   - [ ] Phone
   - [ ] Laptop
6. **Do:** Open https://staging.sightline.zarnik.com/reset-password/old-link
   **You should see:** "Reset link expired" with Send a new reset link.
   - [ ] Phone
   - [ ] Laptop
7. **Do:** Open https://staging.sightline.zarnik.com/invite/sample-invite and set a password.
   **You should see:** "Set your password. Welcome, Neha Joseph." Hotel Harbour View Hotel, Role Staff, Invited by Priya Menon, Access until 1 January 2027. After: a welcome message and the Dashboard.
   - [ ] Phone
   - [ ] Laptop
8. **Do:** Open https://staging.sightline.zarnik.com/invite/sample-expired-invite
   **You should see:** "Invite link expired" with Go to sign in.
   - [ ] Phone
   - [ ] Laptop

## Print layout and email previews

Do these once, as Admin.

1. **Do:** Open https://staging.sightline.zarnik.com/print/audits/01930000-0014-7000-8000-00000000000d/summary and https://staging.sightline.zarnik.com/print/audits/01930000-0014-7000-8000-00000000000d/full
   **You should see:** A plain page with no menu: the Summary report and the Full report for Harbour View Hotel, Ops & Quality, July 2026, laid out for paper.
   - [ ] Phone
   - [ ] Laptop
2. **Do:** Open https://staging.sightline.zarnik.com/design/emails and use the links at the top.
   **You should see:** 11 emails: Invite to join a hotel, Fix assigned to you, Comment added on your fix, Status changed on a fix you assigned, Fix due in 2 days, Fix overdue, Audit report ready, and Access expiring in 7 days and Access expired (each for the person and for whoever invited them). Each shows From, Subject, and Email and Plain text tabs. Only the two reminders say "Can be turned off".
   - [ ] Phone
   - [ ] Laptop

## What is not real yet

- Sign in is sample only. The review bar, not the sign in screen, decides who you are.
- No database. Changes reset as described in Before you start.
- Offline sync is simulated. Saved changes count as synced shortly after you are online.
- Photos and files stay in your browser. Nothing is uploaded.
- Export PDF only shows a message. PDF files are made on the server in a later step. The print pages show the layout.
- No emails are sent. The email previews show what will be sent.
- Fix assignment, invites, access changes and publishing an audit template only change the sample data in your browser.

## How to send feedback

Email Azhar (azhar@zarnik.com) with "Gate 2" in the subject. For each problem, give:

1. Screen link (copy it from the address bar)
2. Role in the review bar
3. Device (phone or laptop, and the browser)
4. What you expected
5. What happened (a screenshot helps)
