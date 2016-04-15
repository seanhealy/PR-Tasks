// ==UserScript==
// @name PRTasks
// @include https://github.com/*/pull/*
// @require jquery-2.2.0.min.js
// ==/UserScript==

(function(){
  if(window.location.hostname === 'github.com' && window.location.pathname.match(/\/pull\/.+?$/)) {
    var RESOLVED_EMOJI = ':white_check_mark:';
    var RESOLVED_EMOJI_SELECTOR = '.emoji[alt="' + RESOLVED_EMOJI + '"], g-emoji[alias="white_check_mark"]';

    var jQueryInstance = jQuery.noConflict(true);

    var queryParents = function(element, selector) {
      var parent = element.parentNode
      if(parent === window) return null;
      if(parent.matches(selector)) return parent;
      return queryParents(parent, selector);
    };

    var buildStatusItem = function(commentID, text) {
      var inner = [
        '<a class="build-status-details right" href="#' + commentID + '">Show</a>',
        '<span aria-hidden="true" class="octicon octicon-x build-status-icon text-error"></span>',
        '<span class="text-muted css-truncate css-truncate-target">',
          '<strong class="text-emphasized"> Unresolved Comment</strong>',
          ' — ' + text.trim(),
        '</span>'
      ].join('');
      var statusItem = document.createElement('div');
      statusItem.classList.add('build-status-item');
      statusItem.classList.add('pr-helper-addition');
      statusItem.innerHTML = inner;
      statusItem.querySelector('a').addEventListener('click', function(event) {
        var commentNumber = commentID.replace(/\D/g,'')
        document.querySelector('#diff-for-comment-' + commentNumber).classList.add('open');
      });
      return statusItem;
    };

    var addStatusItems = function(items) {
      var statusContainer = document.querySelector('.branch-action-body .branch-action-item.js-details-container');
      var statusList = statusContainer.querySelector('.build-statuses-list');
      statusContainer.classList.add('open');

      items.forEach(function(item) {
        statusList.appendChild(item);
      });
    };

    var nodeListMatchesSelector = function(nodeList, selector) {
      nodeList = Array.prototype.slice.call(nodeList);
      return nodeList.findIndex(function(item) {
        return item instanceof Element && item.matches(selector);
      }) !== -1;
    };

    var commentOnConversation = function(conversation, text) {
      var addLineNoteButton = conversation.querySelector('.inline-comment-form-actions').firstElementChild;
      var commentForm = conversation.querySelector('.inline-comment-form form');
      var submitButton = commentForm.querySelector('button[type="submit"]');
      var textarea = commentForm.querySelector('textarea');

      // We need to do a lot of fuckery here to get GitHub to send the comment
      // through its AJAX handlers.
      commentForm.style.height = "0px";
      commentForm.style.overflow = "hidden";

      addLineNoteButton.click();
      textarea.blur();
      jQueryInstance(textarea).val(text).change();
      setTimeout(function() {
        jQueryInstance(submitButton).click();
        setTimeout(function() {
          commentForm.style.height = "";
          commentForm.style.overflow = "";
        }, 500);
      }, 100);
    };

    var rebuild = function () {
      // Cleanup old additions.
      Array.prototype.slice.call(
        document.querySelectorAll('.pr-helper-addition')
      ).forEach(function(oldAddition) {
        oldAddition.remove()
      });

      // var root;
      if(!!document.querySelector('.selected #conversation_tab_counter')) {
        root = document.querySelector('#discussion_bucket');
      }
      else if(!!document.querySelector('.selected #files_tab_counter')) {
        root = document.querySelector('#diff');
      }

      // Find unresolved conversations
      var allConversations = Array.prototype.slice.call(
        root.querySelectorAll('.inline-comments')
      );
      var unresolvedConversations = allConversations.filter(function(conversation) {
        var lastComment = conversation.querySelector('.comment-holder > .comment:last-of-type');
        return !lastComment.querySelector(RESOLVED_EMOJI_SELECTOR);
      });

      // Add `Resolve` buttons.
      unresolvedConversations.forEach(function(conversation){
        var actionsView = conversation.querySelector('.inline-comment-form-actions');
        var resolveButton = document.createElement('button');
        resolveButton.innerHTML = "Resolve";
        resolveButton.classList.add('btn');
        resolveButton.classList.add('pr-helper-addition');
        resolveButton.style.marginLeft = "5px";
        resolveButton.addEventListener('click', function() {
          commentOnConversation(conversation, RESOLVED_EMOJI + ' Resolved');
        });

        actionsView.appendChild(resolveButton);
      });

      // Warn of unresolved conversations.
      if(unresolvedConversations.length > 0) {
        addStatusItems(
          unresolvedConversations.map(function(conversation) {
            var firstComment = conversation.querySelector('.comment-holder > .comment:first-of-type');

            return buildStatusItem(
              firstComment.id,
              firstComment.querySelector('.comment-body').textContent
            );
          })
        );
      }
    };

    // Look for on the fly changes to task-lists.
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var taskObserver = new MutationObserver(function(mutations) {
      var filteredMutations = mutations.filter(function(mutation) {
        return mutation.type === 'childList' &&
          (
            nodeListMatchesSelector(mutation.addedNodes, '.comment') || //, .task-list, .task-list *') ||
            nodeListMatchesSelector(mutation.removedNodes, '.comment')
          )
      });
      if(filteredMutations.length > 0) rebuild();
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
        rebuild();
      }
    });

    pjaxObserver.observe(document.querySelector('#js-repo-pjax-container'), {
      childList: true
    });

    // Initial run.
    rebuild();
  }
})();
