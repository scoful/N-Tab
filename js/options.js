; (function ($) {
    'use strict'

    document.addEventListener('DOMContentLoaded', function () {
        chrome.storage.local.get('options', function (storage) {
            var opts = storage.options || {};

            if (opts.deleteTabOnOpen === undefined) {
                $('input[name="deleteTabOnOpen"][value="no"]').prop('checked', 'checked');
            } else {
                $('input[name="deleteTabOnOpen"][value="' + opts.deleteTabOnOpen + '"]').prop('checked', 'checked');
            }
        });

        document.body.innerHTML = `
            <nav class="navbar navbar-default navbar-fixed-top" style="position:relative">
            <div class="container">
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"
                        aria-expanded="false" aria-controls="navbar">
                        <span class="sr-only">Toggle navigation</span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                    </button>
                    <a class="navbar-brand" href="#">CloudSkyMonster ${chrome.i18n.getMessage("optionsValue")}</a>
                </div>
                <!--/.nav-collapse -->
            </div>
        </nav>
        <div class="container theme-showcase" role="main">
            <div id="options">
                <div class="option">
                    <div class="desc">
                        <p>${chrome.i18n.getMessage("restoreKey")}</p>
                    </div>
                    <div class="choices">
                        <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="yes">${chrome.i18n.getMessage("restoreValueDelete")}</label></p>
                        <p><label for="deleteTabOnOpen"><input type="radio" name="deleteTabOnOpen" value="no">${chrome.i18n.getMessage("restoreValueLive")}</label></p>
                    </div>
                </div>
                <button id="save">${chrome.i18n.getMessage("saveButtonValue")}</button>
                <div id="saved">${chrome.i18n.getMessage("savedValue")}</div>
            </div>
            <hr>
            <div class="blog-footer">
            <p class="pull-right"><a href="#">${chrome.i18n.getMessage("backToTop")}</a></p>
            <p>${chrome.i18n.getMessage("sourceCode")}<a
                    href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.</p>
            <hr>
            </div>
        </div>    
        `;

        document.getElementById('save').addEventListener('click', function () {
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
    });
}(jQuery));
