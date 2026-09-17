AB MEDIA — EASY EDITOR VERSION

WHAT CHANGED
This version includes a browser-based editor at /admin/. Once the site is connected to GitHub and hosted, you can upload images, replace your highlight reel, edit contact info, and add/reorder gallery images without editing HTML.

ONE-TIME SETUP
1. Put this folder in a GitHub repository named ab-media-website.
2. Open admin/config.yml and replace YOUR_GITHUB_USERNAME with your GitHub username.
3. Host the repository on Netlify (or another static host that supports your chosen Decap authentication flow).
4. Configure GitHub authentication for Decap CMS.
5. Visit https://YOUR-SITE.com/admin/ and log in.

AFTER SETUP
Use the editor to change Homepage, Cover Images, Contact, Fashion Gallery, Property Gallery, and Music Gallery. Click Publish; your hosted site updates from the repository.

IMPORTANT
The editor cannot publish from a local file opened by double-clicking index.html. It needs the site to be hosted and connected to a Git repository.
