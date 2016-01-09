{{#w.inDialog}}
<div id="{{w.id}}" class="featureCode
        {{#w.feature.testing}}testing{{/w.feature.testing}}
        {{#w.feature.tested}}tested{{/w.feature.tested}}
        {{#w.feature.failed}}failed{{/w.feature.failed}}
        {{#w.feature.succeed}}succeed{{/w.feature.succeed}}
">
{{/w.inDialog}}
  <div class="featureCode_label colorable">
    {{w.feature.module.name}} - 
    {{w.feature.name}}
  </div>
  <div class="featureCodeBody">
    {{#w.feature}}
      {{#w.feature.failed}}
        <div class="errorMessage">
          {{w.feature.errorInfo.message}}<br/>
          {{w.feature.errorInfo.fileName}}:{{w.feature.errorInfo.lineNumber}}
        </div>
      {{/w.feature.failed}}
    {{/w.feature}}
    <div class="code">
      {{{w.featureCode}}}
    </div>
  </div>
{{#w.inDialog}}
</div>
{{/w.inDialog}}