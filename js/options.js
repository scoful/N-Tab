; (function ($) {
    'use strict'

    var opts = {};

    document.addEventListener('DOMContentLoaded', function () {
        chrome.storage.local.get('options', function (storage) {
            var opts = storage.options || {};

            if (opts.deleteTabOnOpen === undefined) {
                $('input[name="deleteTabOnOpen"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="deleteTabOnOpen"][value="' + opts.deleteTabOnOpen + '"]').prop('checked', 'checked');
            }
        });
    });

    document.getElementsByName('save')[0].addEventListener('click', function () {
        var deleteTabOnOpen = document.querySelector('input[name="deleteTabOnOpen"]:checked').value;

        chrome.storage.local.set({
            options: {
                deleteTabOnOpen: deleteTabOnOpen
            }
        }, function () { // show "settings saved" notice thing
            document.getElementById('saved').style.display = 'block';
            window.setTimeout(function () {
                document.getElementById('saved').style.display = 'none';
            }, 1000);
            chrome.tabs.query({ url: "chrome-extension://*/workbench.html*", currentWindow: true }, function (tab) {
                if (tab.length >= 1) {
                    chrome.tabs.reload(tab[0].id, {}, function (tab) {
                    });
                }
            });
        });
    });

}(jQuery));
