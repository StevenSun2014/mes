package com.qcadoo.mes.basic;

import com.qcadoo.localization.api.TranslationService;
import com.qcadoo.security.api.SecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.util.*;

public abstract class BasicLookupController<R> {

    @Autowired
    private LookupUtils lookupUtils;

    @Autowired
    protected TranslationService translationService;

    @Autowired
    protected SecurityService securityService;

    @Value("${useCompressedStaticResources}")
    protected boolean useCompressedStaticResources;

    protected ModelAndView getModelAndView(final String recordName, final String view, final Locale locale) {
        ModelAndView mav = new ModelAndView();

        mav.addObject("userLogin", securityService.getCurrentUserName());
        mav.addObject("translationsMap", translationService.getMessagesGroup("commons", locale));
        mav.addObject("recordName", recordName);

        mav.setViewName("basic/" + view);
        mav.addObject("useCompressedStaticResources", useCompressedStaticResources);
        return mav;
    }

    protected Map<String, Object> getConfigMap(List<String> columns) {
        Map<String, Object> config = new HashMap<>();

        Map<String, Object> modelId = new HashMap<>();
        modelId.put("name", "id");
        modelId.put("index", "id");
        modelId.put("key", true);
        modelId.put("hidden", true);

        Map<String, Map<String, Object>> colModel = new LinkedHashMap<>();
        colModel.put("ID", modelId);

        columns.forEach(column -> {
            Map<String, Object> model = new HashMap<>();
            model.put("name", column);
            model.put("index", column);
            model.put("editable", false);
            model.put("editoptions", Collections.singletonMap("readonly", "readonly"));

            colModel.put(column, model);
        });

        config.put("colModel", colModel.values());
        config.put("colNames", colModel.keySet());

        return config;
    }

    @ResponseBody
    @RequestMapping(value = "records", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)    
    public GridResponse<R> getRecords(@RequestParam String sidx, @RequestParam String sord,
            @RequestParam(defaultValue = "1", required = false, value = "page") Integer page,
            @RequestParam(value = "rows") int perPage,
            @RequestParam(defaultValue = "0", required = false, value = "context") Long context,
            R record) {

        String query = getQueryForRecords(context);

        return lookupUtils.getGridResponse(query, sidx, sord, page, perPage, record, getQueryParameters(record));
    }

    protected Map<String, Object> getQueryParameters(R record) {
        return new HashMap<>();
    }

    @ResponseBody
    @RequestMapping(value = "config", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getConfigView(Locale locale) {
        return getConfigMap(getGridFields());
    }

    @RequestMapping(value = "lookup", method = RequestMethod.GET)
    public ModelAndView getLookupView(Map<String, String> arguments, Locale locale) {
        ModelAndView mav = getModelAndView(getRecordName(), "genericLookup", locale);

        return mav;
    }

    protected abstract List<String> getGridFields();

    protected abstract String getRecordName();

    protected abstract String getQueryForRecords(final Long context);
}