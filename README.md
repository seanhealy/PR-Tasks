# PR Tasks

In GitHub's current Pull Request interface it is easy to loose track of comments when
the line the comment is on is changed. This *auto resolution* occurs whether or not
the underlying issue has actually been addressed.

This Extension creates an *issue* for each comment thread and adds a warning to the
Pull Request Status until the *issue* is explicitly resolved.

It ignores GitHub's hiding of outdated diffs so they will no longer hide away
unresolved comments.

![Tracks Hidden issues](http://d.pr/i/1kHfT.png)

# Usage

### Creating an Issue

An issue is automatically created whenever you comment on a line in the diff.

### Resolving an Issue

Just click the `Resolve` button at the end of the comment chain. You can also
manually resolve an issue by including a `:white_check_mark:` in a comment.

### Reopening an Issue

To reopen an issue just add another comment after the existing resolution.

# Demo

<center>![Demo](http://d.pr/i/10w9g.gif)</center>

# Installation

Download the [latest release](https://github.com/seanhealy/PR-Tasks/releases/latest).
Then, follow the instructions for your browser.

### Chrome

After downloading, drag the extension file to your extensions list.

https://www.maketecheasier.com/manually-install-extensions-google-chrome/

### Safari

After downloading, open the extension file. Follow the prompts.

### Firefox

After downloading, drag the extension file to your extensions list.

https://support.mozilla.org/en-US/questions/1009049

# Updates

PR Tasks doesn't currently auto update. Will be looking into that next. So, until then you need to do it manually. :(
