package com.slemarchand.page.position;

import java.io.IOException;

import javax.portlet.PortletException;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;
import javax.portlet.filter.FilterChain;
import javax.portlet.filter.FilterConfig;
import javax.portlet.filter.PortletFilter;
import javax.portlet.filter.RenderFilter;
import javax.portlet.filter.RenderResponseWrapper;

import org.osgi.service.component.annotations.Component;

import com.liferay.portal.kernel.util.StringPool;

@Component(
	immediate = true, 
	property = {
	"javax.portlet.name=com_liferay_layout_admin_web_portlet_GroupPagesPortlet" }, 
	service = PortletFilter.class
)
public class GroupPagesRenderFilter implements RenderFilter {

	@Override
	public void doFilter(RenderRequest request, RenderResponse response, FilterChain chain)
			throws IOException, PortletException {

		RenderResponseWrapper renderResponseWrapper = new BufferedRenderResponseWrapper(response);

		chain.doFilter(request, renderResponseWrapper);

		String html = renderResponseWrapper.toString();

		if (html != null) {
			html = html + " <script src=\"/o/page_position/page_position.js?t=1541027832627\" type=\"text/javascript\"></script> ";
		} else {
			html = StringPool.BLANK;
		}
		
		response.getWriter().write(html);
	}
	
	@Override
	public void init(FilterConfig filterConfig) throws PortletException {
	}

	@Override
	public void destroy() {
	}

}