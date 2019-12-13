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

        document.getElementById("container").innerHTML = `
        <header>
            <h1>CloudSkyMonster <span style="font-size: .6em;">${chrome.i18n.getMessage("optionsValue")}</span></h1>
        </header>

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

        <footer role="contentinfo">
        ${chrome.i18n.getMessage("sourceCode")}
        <a href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.
        </footer>
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
