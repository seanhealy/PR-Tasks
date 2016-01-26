(function(){
  if(window.location.hostname === 'github.com' && window.location.pathname.match(/\/pull\/\d+$/)) {
    var queryParents = function(element, selector) {
      var parent = element.parentNode
      if(parent === window) return null;
      if(parent.matches(selector)) return parent;
      return queryParents(parent, selector);
    };

    var buildStatusItem = function(commentID, text) {
      var inner = [
        '<a class="build-status-details right" href="#' + commentID + '">Details</a>',
        '<span aria-hidden="true" class="octicon octicon-x build-status-icon text-error"></span>',
        '<span class="text-muted css-truncate css-truncate-target">',
          '<strong class="text-emphasized"> Incomplete Task</strong>',
          ' — ' + text,
        '</span>'
      ].join('');
      var statusItem = document.createElement('div');
      statusItem.classList.add('build-status-item');
      statusItem.classList.add('pr-helper-item');
      statusItem.innerHTML = inner;
      return statusItem;
    };

    var nodeListMatchesSelector = function(nodeList, selector) {
      nodeList = Array.prototype.slice.call(nodeList);
      return nodeList.findIndex(function(item) {
        return item instanceof Element && item.matches(selector);
      }) !== -1;
    }

    var rebuildIssues = function () {
      // Cleanup old PR comment status items.
      var oldIssues = document.querySelectorAll('.pr-helper-item');
      oldIssues = Array.prototype.slice.call(oldIssues);
      oldIssues.forEach(function(oldIssue) {
        oldIssue.remove()
      });

      // Scan and update comment status items.
      var unresolvedIssues = document.querySelectorAll('#discussion_bucket .task-list-item-checkbox[type=checkbox]:not([checked])');
      unresolvedIssues = Array.prototype.slice.call(unresolvedIssues);

      if(unresolvedIssues.length > 0) {
        var statusContainer = document.querySelector('.branch-action-body .branch-action-item.js-details-container');
        var statusList = statusContainer.querySelector('.build-statuses-list');

        statusContainer.classList.add('open');

        unresolvedIssues.forEach(function(issueCheckbox) {
          var issueComment = queryParents(issueCheckbox, '.comment');
          statusList.appendChild(buildStatusItem(
            issueComment.id,
            issueCheckbox.parentNode.textContent.trim()
          ));
        });
      }
    }

    // Look for on the fly changes to task-lists.
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var taskObserver = new MutationObserver(function(mutations) {
      var filteredMutations = mutations.filter(function(mutation) {
        return mutation.type === 'childList' &&
          (
            nodeListMatchesSelector(mutation.addedNodes, '.comment, .task-list, .task-list *') ||
            nodeListMatchesSelector(mutation.removedNodes, '.comment')
          )
      });
      if(filteredMutations.length > 0) rebuildIssues();
    });

    taskObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Handle PJAX reload.
    var pjaxObserver = new MutationObserver(function(mutations) {
      if(mutations.findIndex(function(mutation) {
        return !!mutation.addedNodes.length
      }) !== -1) {
        console.log('New Content Ready');
        rebuildIssues();
      }
    });

    pjaxObserver.observe(document.querySelector('#js-repo-pjax-container'), {
      childList: true
    });

    // Initial run.
    rebuildIssues();
  }
})();
