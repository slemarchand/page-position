package com.slemarchand.page.position;


import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.liferay.portal.kernel.exception.LayoutParentLayoutIdException;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.service.LayoutService;
import com.liferay.portal.kernel.struts.BaseStrutsAction;
import com.liferay.portal.kernel.struts.StrutsAction;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.petra.string.StringPool;


@Component(
	immediate = true, property = "path=/portal/page_position/edit",
	service = StrutsAction.class
)
public class PagePositionEditAction extends BaseStrutsAction {

		public String execute(
				HttpServletRequest request, HttpServletResponse response)
			throws Exception {

		long plid = ParamUtil.getLong(request, "plid", 0);
		long parentPlid = ParamUtil.getLong(request, "parentPlid", 0);
		long siblingPlid = ParamUtil.getLong(request, "siblingPlid", 0);
		int priority = ParamUtil.getInteger(request, "priority", 0);
		
		logParameters(plid, priority, parentPlid, siblingPlid);
		
		try {
			if(siblingPlid > 0) {
				parentPlid = layoutLocalService.getLayout(siblingPlid).getParentPlid();
			} 
			
			layoutService.updateParentLayoutIdAndPriority(plid, parentPlid, priority);
		
			
		} catch (LayoutParentLayoutIdException e) {	
			
			log.debug(e.getMessage(), e);
			
			sendError(response, HttpServletResponse. SC_FORBIDDEN, getMessage(e));
			
		} catch (PortalException e) {
			
			log.error(e.getMessage(), e);
			
			sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, e.getMessage());
		}
		
		return null;
	}
		
	private void logParameters(long plid, int priority, long parentPlid, long siblingPlid) {
		if (log.isDebugEnabled()) {
			log.debug(String.format("edited layout: %s, new priority: %s, new parent: %s, new sibling: %s",
					getLayoutInfos(plid), priority, getLayoutInfos(parentPlid), getLayoutInfos(siblingPlid)));
		}
	}

	private String getLayoutInfos(long plid) {
		
		String infos = StringPool.BLANK;
		
		Layout l = layoutLocalService.fetchLayout(plid);

		if(l != null) {
			String languageId = l.getDefaultLanguageId();
			infos = String.format("{plid: %s, name: '%s', priority: %s}", l.getPlid(), l.getName(languageId), l.getPriority());
		}
		
		return infos;
	}

	private void sendError(HttpServletResponse response, int status, String message) throws IOException {
		response.addHeader("X-Error-Message", message);
		response.sendError(status, message);
	}	

	private String getMessage(LayoutParentLayoutIdException e) {

		String message;

		int type = e.getType();

		switch (type) {
		case LayoutParentLayoutIdException.FIRST_LAYOUT_TYPE:
			message = "Page cannot be moved as first page";
			break;
		case LayoutParentLayoutIdException.NOT_PARENTABLE:
			message = "Page cannot have children ";
			break;
		case LayoutParentLayoutIdException.NOT_SORTABLE:
			message = "Page is not sortable";
			break;
		case LayoutParentLayoutIdException.SELF_DESCENDANT:
			message = "Page cannot have itself as parent";
			break;
		default:
			message = e.getMessage();
			break;
		}

		return message;
	}

	private Log log = LogFactoryUtil.getLog(PagePositionEditAction.class);
	
	@Reference
	private LayoutService layoutService;
	
	@Reference
	private LayoutLocalService layoutLocalService;

}
