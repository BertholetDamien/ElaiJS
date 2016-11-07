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