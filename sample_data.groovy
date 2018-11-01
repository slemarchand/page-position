import com.liferay.portal.kernel.exception.*;
import com.liferay.portal.kernel.model.*;
import com.liferay.portal.kernel.service.*;
import com.liferay.portal.kernel.util.*;
import com.liferay.portal.scripting.groovy.context.*;
import java.util.*;

def addTree(actionRequest) throws PortalException {

	long userId = PortalUtil.getUserId(actionRequest);

	long groupId = addSite();

	boolean privateLayout = false;

	addChildren(userId, groupId, 1, LayoutConstants.DEFAULT_PARENT_LAYOUT_ID, "");
}

def addSite() {

	context = new GroovyScriptingContext();

	Date now = new Date();

	site = GroovySite.openSite("Sample Data ${now}","");

	site.create(context);

	return site.group.groupId;
}
	
def addChildren(long userId, long groupId, int level, long parentLayoutId, String parentName) throws PortalException {

	if(level > 3) { return; }
	
	boolean privateLayout = false;
	
	String description = "";
	
	String title = "";

	String type = LayoutConstants.TYPE_PORTLET;
	
	boolean hidden = false;
	
	ServiceContext serviceContext = new ServiceContext();
	
	for (int i = 1; i <= 4; i++) {
		
		String name = parentName + (parentName.isEmpty()?"":"-") + String.format("L%02d-%02d", level, i);
		
		String friendlyURL = "/" + name.toLowerCase();
		
		log("Adding ${name} (${friendlyURL})...");

		Layout layout  = LayoutLocalServiceUtil.addLayout(userId, groupId, privateLayout, parentLayoutId, name, title, description, type, hidden, friendlyURL, serviceContext);	
		
		addChildren(userId, groupId, level + 1, layout.getLayoutId(), name);
	}
}

def log(message) {
	out.println(message);
	System.out.println(message);
}

try {
	addTree(actionRequest);
} catch(e) {
	e.printStackTrace(out);
}