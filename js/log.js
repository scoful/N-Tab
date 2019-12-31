; (function (m) {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        console.log("load完log了");

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
                    <a class="navbar-brand" href="#">Gist Log</a>
                </div>
                <div id="navbar" class="navbar-collapse collapse">
                    <ul class="nav navbar-nav">
                        <li>
                            <a href="#">
                                <span id="totalLogs"></span>${chrome.i18n.getMessage("logsNo")}</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
        </nav>
        <div class="container theme-showcase" role="main">
                <div id="logs"></div>
            <hr>
            <div class="blog-footer">
            <p class="pull-right"><a href="#">${chrome.i18n.getMessage("backToTop")}</a></p>
            <p>${chrome.i18n.getMessage("sourceCode")}<a
                    href="https://github.com/scoful/cloudSkyMonster">GitHub</a>.</p>
            <hr>
            </div>
        </div>
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
                document.getElementById('totalLogs').innerHTML = bridge.length;
            } else {
                document.getElementById('totalLogs').innerHTML = 0;
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
                    return m('div',
                        m('div.jumbotron',
                            [m('div', { style: "text-align:center; margin-bottom:50px" }, `${chrome.i18n.getMessage("noLog")}`)
                            ]))
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