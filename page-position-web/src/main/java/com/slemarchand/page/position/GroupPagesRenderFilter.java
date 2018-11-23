package com.slemarchand.page.position;

import java.io.IOException;
import java.util.Date;

import javax.portlet.PortletException;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.filter.FilterChain;
import javax.portlet.filter.FilterConfig;
import javax.portlet.filter.PortletFilter;
import javax.portlet.filter.RenderFilter;
import javax.portlet.filter.RenderResponseWrapper;

import org.osgi.framework.Bundle;
import org.osgi.framework.FrameworkUtil;
import org.osgi.service.component.annotations.Component;

import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.PropsUtil;

@Component(
	immediate = true, 
	property = {
	"javax.portlet.name=com_liferay_layout_admin_web_portlet_GroupPagesPortlet" }, 
	service = PortletFilter.class
)
public class GroupPagesRenderFilter implements RenderFilter {

	private static final boolean ALWAYS_RELOAD_RESOURCES = GetterUtil.getBoolean(PropsUtil.get("page.position.always.reload.resources"), false);
	
	@Override
	public void doFilter(RenderRequest request, RenderResponse response, FilterChain chain)
			throws IOException, PortletException {

		RenderResponseWrapper renderResponseWrapper = new BufferedRenderResponseWrapper(response);

		chain.doFilter(request, renderResponseWrapper);

		String html = renderResponseWrapper.toString();

		if (html != null) {
			html = html + " <script src=\"/o/page_position/page_position.js?t=" + getTimestamp() + "\" type=\"text/javascript\"></script> ";
		} else {
			html = StringPool.BLANK;
		}
		
		response.getWriter().write(html);
	}
	
	private String getTimestamp() {
		
		Bundle bundle = FrameworkUtil.getBundle(GroupPagesRenderFilter.class).getBundleContext().getBundle();
		
		long t;
		
		if(ALWAYS_RELOAD_RESOURCES) {
			t = new Date().getTime();
		} else {
			t = bundle.getLastModified();
		}
		
		return Long.toString(t);
	}

	@Override
	public void init(FilterConfig filterConfig) throws PortletException {
		log.info("Initialize Page Position Web (https://github.com/slemarchand/page-position)");
	}

	@Override
	public void destroy() {
	}

	private Log log = LogFactoryUtil.getLog(GroupPagesRenderFilter.class);
}