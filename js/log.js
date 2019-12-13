; (function (m) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完log了");

        document.getElementById("container").innerHTML = `
        <header>
            <h1>Gist Log
            </h1>
        </header>
        <div id="logs"></div>
        <footer role="contentinfo">
        ${chrome.i18n.getMessage("sourceCode")}<a
                href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.
        </footer>
        `;
        // 展示Log
        showAllLogs();
    });

    // 展示Log
    function showAllLogs() {
        chrome.storage.local.get(function (storage) {
            console.log(storage)
            var bridge = [];
            if (storage.gistLog) {
                bridge = storage.gistLog;
                console.log(bridge)
            }
            var logs = {}, // to-be module
                logGroups = bridge || [];

            // model entity
            logs.LogGroup = function (data) {
                this.type = m.prop(data.handleGistType);
                this.id = m.prop(data.id);
                this.logs = m.prop(data.handleGistLogs);
            };

            // alias for Array
            logs.LogGroupsList = Array;

            // view-model
            logs.vm = new function () {
                var vm = {};
                vm.init = function () {
                    vm.list = new logs.LogGroupsList();
                };
                return vm;
            };

            logs.controller = function () {
                var i;
                logs.vm.init();
                for (i = 0; i < logGroups.length; i += 1) {
                    logs.vm.list.push(new logs.LogGroup(logGroups[i]));
                }
            };

            logs.view = function () {
                if (logs.vm.list.length === 0) {
                    return m('p', `${chrome.i18n.getMessage("noLog")}`);
                }

                return logs.vm.list.map(function (group, i) {
                    return m('div', {
                        id: i
                    }, [
                        m('div', [
                            m('span.group-title', {
                                onclick: function () {
                                    $("#logs_" + i).slideToggle();
                                }
                            }, group.type())
                        ]),
                        m('ul', {
                            id: "logs_" + i
                        }, group.logs().map(function (log, ii) {
                            return m('li.li-hover', [
                                m('span.line', {
                                }, log)
                            ]);
                        }))
                    ]);
                });
            };
            // init the app
            m.module(document.getElementById('logs'), { controller: logs.controller, view: logs.view });
        });
    };
}(m));