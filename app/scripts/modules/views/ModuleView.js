define([
    'app',
    'backbone',
    'backbone.marionette',
    'd3',
    'hbs!../templates/module',
    'underscore',
    'localforage',
    './BiddingStatsView',
    'bootstrap/tooltip'
  ],
  function (App, Backbone, Marionette, d3, template, _, localforage, BiddingStatsView) {
    'use strict';

    var searchPreferences = {};

    function drawTree(data, toggle) {

            var SVGWidth = $("#Tree").width();
            var SVGHeight = 550;
            var pathColor = $('body').attr('data-mode') === 'default' ? '#000' : '#fff';

            d3.selectAll("svg").remove();
            
            var canvas = d3.select('#Tree')
                .append("svg")
                .attr("id", "svg")
                .attr("width", SVGWidth)
                .attr("height", SVGHeight)
                .attr("style", "cursor: move; z-index: -999;");
            
            var interact = d3.behavior.zoom()
                .scaleExtent([0.3, 5.0])
                .on("zoom", zoom);

            canvas = canvas.append("g")
                .attr("id", "drawarea");

            interact(d3.select("svg"));

            function zoom() {
                d3.select("#drawarea")
                    .attr("transform", "translate(" + d3.event.translate + ")" +
                        " scale(" + d3.event.scale + ")");
            }

            var aspect = $("#svg").width() / $("#svg").height();

            var tree = d3.layout.tree()
                .nodeSize([130, 130]);

            var nodes = tree.nodes(data);
            var links = tree.links(nodes);

            

            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });
            var x, y;
            canvas.selectAll(".link")
                .data(links)
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("fill", "none")
                .attr("stroke", pathColor)
                .attr("opacity", 0)
                .attr("d", diagonal);

            var node = canvas.selectAll(".node")
                .data(nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            var rectangles = node.append("rect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("x", function(d) {
                    if (d.name == 'or' || d.name == 'and') {
                        return -25;
                    } else
                        return -50;
                })
                .attr("y", function(d) {
                    if (d.name == 'or' || d.name == 'and') {
                        return -17.5;
                    } else
                        return -35;
                })
                .attr("rx", 20)
                .attr("ry", 20)
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .attr("opacity", function(d) {
                    if (d.name == 'or' || d.name == 'and') {
                        return 0;
                    } else
                        return 1;
                })
                .attr("nodeValue", function(d) {
                    return d.name;
                })
                .attr("fill", function(d) {
                    if (d['done'])
                        return "red";
                    else if (d['prec'])
                        return "yellow";
                    else
                        return "#f60";
                })
                .attr("style", function(d) {
                    if (d.name == 'or' || d.name == 'and')
                        return "cursor:default"
                });

            var labels = node.append("text")
                .text(function(d) {
                    return d.name;
                })
                .style("fill", "#ccc")
                .style("opacity", 0)
                .attr("dy", function(d) {
                    if (d.name == 'or' || d.name == 'and')
                        return "10";
                    return "";
                })
                .attr("text-anchor", "middle")
                .attr("class", "lead");

            node.selectAll("rect")
                .transition()
                .duration(1000)
                .attr("width", function(d) {
                    if (d.name == 'or' || d.name == 'and')
                        return 50;
                    else
                        return 100;
                })
                .attr("height", function(d) {
                    if (d.name == 'or' || d.name == 'and')
                        return 35;
                    else
                        return 70;
                })
                .ease("elastic");

            canvas.selectAll("path")
                .transition()                
                .duration(500)
                .attr("opacity", 1);

            node.selectAll("text")
                .transition()
                .duration(500)
                .style("fill", pathColor)
                .style("opacity", 1)
                .style('cursor', 'pointer')
                .attr("style", function(d) {
                    if (d.name == 'or' || d.name == 'and')
                        return "font-size: 50px;"
                })
                .each("end", function() {
                    node.on("mouseout", function() {
                        node.selectAll("rect")
                            .transition()
                            .attr("fill", function(d) {
                                if (d['done'])
                                    return "red";
                                else if (d['prec'])
                                    return "yellow";
                                else
                                    return "#f60";
                            })
                            .attr("height", function(d) {
                                if (d.name == 'or' || d.name == 'and')
                                    return 35;
                                else
                                    return 70;
                            })
                            .attr("y", function(d) {
                                if (d.name == 'or' || d.name == 'and')
                                    return -17.5;
                                else
                                    return -35;
                            })
                            .attr("x", function(d) {
                                if (d.name == 'or' || d.name == 'and')
                                    return -25;
                                else
                                    return -50;
                            })
                            .attr("width", function(d) {
                                if (d.name == 'or' || d.name == 'and')
                                    return 50;
                                else
                                    return 100;
                            })
                            .attr("opacity", function(d) {
                                if (d.name == 'and' || d.name == 'or')
                                    return 0;
                                else
                                    return 1;
                            });
                        node.selectAll("text")
                            .transition()
                            .style("opacity", 1);
                    });
                    node.on("mouseover", function(d) {
                        if (d.name != 'and' && d.name != 'or') {
                            node.selectAll("rect")
                                .transition()
                                .attr("fill", function(d) {
                                    if (d['done'])
                                        return "red";
                                    else if (d['prec'])
                                        return "yellow";
                                    else
                                        return "#f60";
                                })
                                .attr("height", function(d) {
                                    if (d.name == 'and' || d.name == 'or')
                                        return 35;
                                    else
                                        return 70;
                                })
                                .attr("y", function(d) {
                                    if (d.name == 'and' || d.name == 'or')
                                        return -17.5;
                                    else
                                        return -35;
                                })
                                .attr("x", function(d) {
                                    if (d.name == 'and' || d.name == 'or')
                                        return -25;
                                    else
                                        return -50;
                                })
                                .attr("width", function(d) {
                                    if (d.name == 'and' || d.name == 'or')
                                        return 50;
                                    else
                                        return 100;
                                })
                                .attr("opacity", function(d) {
                                    if (d.name == 'and' || d.name == 'or')
                                        return 0;
                                    else
                                        return 0.3;
                                })
                                .attr("style", 'cursor:pointer');
                            node.selectAll("text")
                                .transition()
                                .style("opacity", 0.3);
                            d3.select(this)
                                .select("text")
                                .transition()
                                .style("opacity", 1);

                            d3.select(this)
                                .select("rect")
                                .transition()
                                .attr("fill", "#ccc");

                            node.on("click", function(d) {
                                if (d.name != 'and' && d.name != 'or') {
                                    var currMod = d3.select(this).text();
                                    console.log(currMod);
                                }
                            });
                        }
                    });
                });

            $(window).on("resize", function() {
                console.log("In");
                SVGWidth = $('#Tree').parent().width() - 10;
                d3.select("#svg")
                    .attr("width", SVGWidth);
                var translation = [(SVGWidth) / 2, 75]
                interact.translate(translation);
                d3.select("#drawarea")
                    .transition()
                    .delay(1)
                    .attr("transform", "translate(" + translation + ")" +
                        " scale(" + interact.scale() + ")");

            }).trigger("resize");
        }

    return Marionette.LayoutView.extend({
      template: template,
      regions: {
        biddingStatsRegion: '#bidding-stats'
      },
      initialize: function () {

        if (this.model.get('section') === 'modmaven') {
          var module = this.model.get('module').ModuleCode;
          $.getJSON("http://nusmodmaven.appspot.com/gettree?modName=" + module)
              .done(function(data) {
                  drawTree(data, false);
              });
        }
        
        if (this.model.get('section') === 'corspedia') {
          var formElements = {
            'faculty': '#faculty',
            'account': '#account',
            'student': 'input:radio[name="student-radios"]'
          };

          var defaults = {
            'faculty': 'default',
            'account': 'P',
            'student': 'true'
          };

          var that = this;
          var loadedItems = 0;
          _.each(formElements, function (selector, item) {
            localforage.getItem(item, function (value) {
              if (!value) {
                value = defaults[item];
                localforage.setItem(item, value);
              }
              $(selector).val([value]);
              searchPreferences[item] = value;
              loadedItems++;
              if (loadedItems === _.keys(formElements).length) {
                that.showBiddingStatsRegion(true);
              }
            });
          });
        }
      },
      events: {
        'change #faculty, input:radio[name="student-radios"], #account': 'updateCorspedia',
        'click .show-full-desc': 'showFullDescription',
        'click #show-all-stats': 'showAllStats',
        'click .add': function(event) {
          var qtipContent;
          if (App.request('isModuleSelected', this.model.get('module').ModuleCode)) {
            qtipContent = 'Already added!';
          } else {
            qtipContent = 'Added!';
            App.request('addModule', this.model.get('module').ModuleCode);
          }
          $(event.currentTarget).qtip({
            content: qtipContent,
            show: {
              event: false,
              ready: true
            },
            hide: {
              event: false,
              inactive: 1000
            }
          });
        }
      },
      onShow: function () {
        var module = this.model.get('module');
        var code = module.ModuleCode;

        var disqusShortname = 'nusmods';

        (function () {
          if (typeof disqus_domain !== 'undefined') {
            DISQUSWIDGETS.domain = 'disqus.com';
          }
          DISQUSWIDGETS.forum = disqusShortname;
          DISQUSWIDGETS.getCount();
        })();

        if (this.model.get('section') === 'reviews') {
          // Only reset Disqus when showing reviews section
          if (!window.DISQUS) {
            (function() {
              var dsq = document.createElement('script');
              dsq.type = 'text/javascript';
              dsq.async = true;
              dsq.src = '//nusmods.disqus.com/embed.js';
              (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
          } else {
            DISQUS.reset({
              reload: true,
              config: function () {
                this.page.identifier = code;
                this.page.title = code + ' ' + module.ModuleTitle + ' · Reviews';
                this.page.url = 'http://nusmods.com/modules/' + code + '/reviews';
              }
            });
          }
        }
        $('.nm-help').tooltip();
      },
      showFullDescription: function () {
        $('.module-desc').addClass('module-desc-more');
        return false;
      },
      showAllStats: function () {
        this.showBiddingStatsRegion(false);
      },
      updateCorspedia: function ($ev) {
        var $target = $($ev.target);
        $target.blur();
        var property = $target.attr('data-pref-type');
        var value = $target.val();
        if (this.savePreference(property, value)) {
          searchPreferences[property] = value;
          this.showBiddingStatsRegion(true);
        }
      },
      showBiddingStatsRegion: function (displayFiltered) {
        var biddingStatsDeepCopy = $.extend(true, {},
          this.model.attributes.module.FormattedCorsBiddingStats);
        var biddingStatsModel = new Backbone.Model({stats: biddingStatsDeepCopy});
        var biddingStatsView = new BiddingStatsView({model: biddingStatsModel});

        var faculty = searchPreferences.faculty;
        var accountType = searchPreferences.account;
        var newStudent = searchPreferences.student === 'true';

        if (faculty && faculty !== 'default' && accountType && displayFiltered) {
          biddingStatsView.filterStats(faculty, accountType, newStudent);
        }

        this.biddingStatsRegion.show(biddingStatsView);
      },
      savePreference: function(property, value) {
          if (property === 'faculty' && value === 'default') {
              alert('You have to select a faculty.');
              localforage.getItem(property, function(value) {
                  $('#faculty').val(value);
              });
              return false;
          }
          localforage.setItem(property, value);
          return true;
      }
  });
});
