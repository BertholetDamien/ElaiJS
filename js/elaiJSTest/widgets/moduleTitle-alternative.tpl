<div class="inline up center">
  <div class="left">
    <a  title="{{#lang}}title_open{{/lang}}"
        class="icon open_icon"
        href="{{#buildHash}}page=moduleDetail&name={{w.module.name}}{{/buildHash}}"
    >
    </a>
    <div title="{{#lang}}title_retest{{/lang}}" class="icon reload_icon"></div>
    <div title="{{#lang}}title_canceltest{{/lang}}" class="icon cancel_icon"></div>
  </div>
  <div class="module_name module_label colorable">
    {{w.module.name}}
  </div>
  <div class="right">
    <span class="module_status module_label colorable">
      {{#w.module.failed}}
        {{#lang}}failed{{/lang}}
      {{/w.module.failed}}
      
      {{#w.module.succeed}}
        {{#lang}}succeed{{/lang}}
      {{/w.module.succeed}}
      
      {{#w.module.testing}}
        {{#lang}}testing{{/lang}}
      {{/w.module.testing}}
      
      {{#w.module.waiting}}
        {{#lang}}waiting{{/lang}}
      {{/w.module.waiting}}
      
      {{#w.module.loading}}
        {{#lang}}loading{{/lang}}
      {{/w.module.loading}}
      
      {{#w.module.cancelled}}
        {{#lang}}cancelled{{/lang}}
      {{/w.module.cancelled}}
    </span>
  </div>
</div>
<div class="inline down">
  <span class="module_info module_label colorable">
    {{#w.module.tested}}
      {{#lang}}key=xfeaturestested&count={{w.module.featuresCount}}{{/lang}}
    {{/w.module.tested}}
    
    {{#w.module.testing}}
      {{#lang}}
        key=xOnyfeaturestested&
        countTested={{w.module.featuresTestedCount}}&
        countTotal={{w.module.featuresCount}}
      {{/lang}}
    {{/w.module.testing}}
    
    {{#w.module.loading}}
      {{#lang}}loadingfeatures{{/lang}}
    {{/w.module.loading}}

    {{#w.module.waiting}}
      {{#lang}}key=xfeaturestotest&count={{w.module.featuresCount}}{{/lang}}
    {{/w.module.waiting}}
    
    {{#w.module.cancelled}}
      {{#lang}}
        key=xOnyfeaturestested&
        countTested={{w.module.featuresTestedCount}}&
        countTotal={{w.module.featuresCount}}
      {{/lang}}
    {{/w.module.cancelled}}
  </span>
  
  {{#w.module.tested}}
    <span class="right time colorable">
      {{#w.module.hasError}}
        {{#lang}}key=intime&time={{w.module.time}}{{/lang}}
      {{/w.module.hasError}}
      {{^w.module.hasError}}
        {{#lang}}key=time&time={{w.module.time}}{{/lang}}
      {{/w.module.hasError}}
    </span>
  {{/w.module.tested}}
  <span class="right errors_label colorable
                {{#w.module.hasError}}error{{/w.module.hasError}}
                {{#w.module.succeed}}hide{{/w.module.succeed}}
                {{#w.module.waiting}}hide{{/w.module.waiting}}
                {{#w.module.loading}}hide{{/w.module.loading}}">
    {{#w.module.hasErrors}}
      {{#lang}}key=xerrors&count={{w.module.featuresFailedCount}}{{/lang}}
    {{/w.module.hasErrors}}
    {{^w.module.hasErrors}}
      {{#lang}}key=xerror&count={{w.module.featuresFailedCount}}{{/lang}}
    {{/w.module.hasErrors}}
  </span>
</div>