function d_mal_area(node) {
	var h2 = document.createElement("h2");
	h2.innerHTML = node.getAttribute("name");
	div_main.appendChild(h2);
	if (node.getAttribute("comment") != null) {
		div_main.innerHTML += node.getAttribute("comment") + "<br/>";
	}
}

function d_mal_composite(node) {
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// Name
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 3))
	tblBody.appendChild(row)

	// Extends
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Extends"))
	if (node.childrenByTag("mal:extends")) {
		var super_type = node.childrenByTag("mal:extends")[0]// there only
		// one entry in
		// extends
		row.appendChild(td_with_text(str_mal_node_type(super_type), 3))
	} else {
		row.appendChild(td_with_text("MAL:Composite", 3))
	}
	tblBody.appendChild(row)

	// short form part
	if (node.getAttribute("shortFormPart")) {
		var row = document.createElement("tr");
		row.appendChild(blue_td_with_text("Short Form Part"))
		row.appendChild(td_with_text(node.getAttribute("shortFormPart"), 3))
		tblBody.appendChild(row)
	}

	// fields
	if (node.childrenByTag("mal:field")) {
		var header_row = tableRow([ "Field", "Type", "Nullable", "Comment" ]);
		header_row.setAttribute("class", "blue_bg");
		tblBody.appendChild(header_row)

		node
				.childrenByTag("mal:field")
				.map(
						function(f) {
							row = document.createElement("tr");
							row
									.appendChild(td_with_text(f
											.getAttribute("name")))
							row.appendChild(td_with_text(str_mal_node_type(f)))
							row
									.appendChild(td_with_text(f
											.getAttribute("canBeNull") == "true" ? "Yes"
											: "No"))
							var tdl = td_with_text(f.getAttribute("comment"));
							tdl.style.textAlign = "left";
							row.appendChild(tdl)
							tblBody.appendChild(row)
						})
	} else {
		// Abstract
		var row = document.createElement("tr");
		row.appendChild(blue_td_with_text("Abstract", 4))
		tblBody.appendChild(row)
	}

	tbl.appendChild(tblBody);
	div_main.appendChild(tbl);

	div_main.innerHTML += "<br/>"

	draw_comments(node)
}

function d_mal_ip(node) {
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	d_mal_ip_header(tblBody, node.getAttribute("name"),
			LONG_NAMES[node.tagName])

	// Body header
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Pattern Sequence"))
	row.appendChild(blue_td_with_text("Message"))
	row.appendChild(blue_td_with_text("Body Signature"))
	tblBody.appendChild(row)

	// messages, assumes only one message entry
	node.eachTag("mal:messages", function(msg) {
		$(msg).children().each(function(c) {
			tblBody.appendChild(tr_mal_message(msg.children[c]))
		})
	})

	tbl.appendChild(tblBody);
	div_main.appendChild(tbl);

	div_main.innerHTML += "<br/>"

	draw_errors(node)

	draw_comments(node)
}

function d_mal_ip_header(tblBody, id, ip) {
	// Operation identifier
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Operation Identifier"))
	row.appendChild(td_with_text(id, 2))
	tblBody.appendChild(row)

	// Interaction Pattern
	var row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Interaction Pattern"))
	row.appendChild(gray_td_with_text(ip, 2))
	tblBody.appendChild(row)
}

function d_mal_service(node) {
	var area = node.parentNode

	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// ------------------ first blue header ------------------
	var header_row = tableRow(SERVICE_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	out = node
	tblBody.appendChild(tableRow([// 
	area.getAttribute("name"), // area identifier
	node.getAttribute("name"), // service identifier
	area.getAttribute("number"), // area number
	node.getAttribute("number"), // service number
	area.getAttribute("version") // area version
	]))

	// -------------------- second blue header ------------------
	var header_row = tableRow(OP_LIST_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	// ---------------------- operations -------------------------
	var operations = []
	node.eachTag("mal:capabilitySet", function(cs) {
		$(cs).children().each(function(idx) {
			var ip = cs.children[idx]
			if (typeof ip != 'undefined') {
				// updates list of all operations on parent node
				if (ip.tagName.match(/mal:.*IP/)) {
					// parent node is service
					operations.push($(ip))
				}
			}
		})
	})

	console.info(operations)

	for (opi in operations) {
		op = operations[opi]

		tblBody.appendChild(tableRow([//
		LONG_NAMES[op[0].tagName],// 
		op[0].getAttribute("name"),//
		op[0].getAttribute("number"), // area
		op[0].getAttribute("supportInReplay"),
				op[0].parentNode.getAttribute("number") ]))
	}

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);

	div_main.appendChild(tbl);

	draw_comments(node)

	// ------------------ Documents ---------------------

	node.eachTag("mal:documentation", function(doc) {
		var h2 = document.createElement("h2");
		h2.innerHTML = doc[0].getAttribute("name")
		div_main.appendChild(h2);
		div_main.innerHTML += doc[0].textContent;
	})
}

function d_mal_enum(node) {
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");
	var row

	// name
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Name"))
	row.appendChild(td_with_text(node.getAttribute("name"), 2))
	tblBody.appendChild(row);
	// short form
	row = document.createElement("tr");
	row.appendChild(blue_td_with_text("Short Form Part"))
	row.appendChild(td_with_text(node.getAttribute("shortFormPart"), 2))
	tblBody.appendChild(row);

	var header_row = tableRow(ENUM_LIST_HEADER);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	out = node

	for (it in node.childrenByTag("mal:item")) {
		item = node.childrenByTag("mal:item", it)
		row = document.createElement("tr");
		row.appendChild(td_with_text(item.getAttribute("value")))
		row.appendChild(td_with_text(item.getAttribute("nvalue")))
		row.appendChild(td_with_text(item.getAttribute("comment")))
		tblBody.appendChild(row);
	}

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);

	div_main.appendChild(tbl);

	draw_comments(node)
}

function d_mal_documentation(node) {
	default_drawer(node)
}

function default_drawer(xml_node) {
	draw_table(xml_node)
	draw_comments(xml_node)
}

function draw_table(xml_node) {
	var keys = xml_node.getAttributeNames()
	var comment = xml_node.getAttribute("comment")

	if (typeof comment != 'undefined' && comment != null) {
		var index = keys.indexOf("comment")
		keys.splice(index, 1)
	}

	var elements = keys.map(function(k) {
		return xml_node.getAttribute(k)
	})

	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");

	// ------------------ first blue header ------------------
	var header_row = tableRow(keys);
	header_row.setAttribute("class", "blue_bg");
	tblBody.appendChild(header_row)

	tblBody.appendChild(tableRow(elements))

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);

	div_main.appendChild(tbl);
}

function tr_mal_message(node) {
	var row = document.createElement("tr");
	var tag = node.tagName
	row.appendChild(gray_td_with_text(IN_OR_OUT[tag]))
	row.appendChild(gray_td_with_text(MESSAGE_NAMES[tag]))

	var td = td_with_text("")

	var ul = document.createElement("ul");

	for (f in node.childrenByTag("mal:field")) {
		field = node.childrenByTag("mal:field")[f]

		var li = document.createElement("li");
		li.innerHTML = str_mal_node_type(field)// str_mal_field(field)
		li.innerHTML += " "

		var elem_name = document.createElement("a");
		elem_name.innerHTML = field.getAttribute("name")
		li.appendChild(elem_name)

		if (field.getAttribute("comment")
				&& field.getAttribute("comment") != "") {
			// on hover comment
			var comment_div = document.createElement("div");
			var comment_div_id = "comment_" + field.getAttribute("name")
			var comment_li_id = "li_" + field.getAttribute("name")
			var elem_name_div_id = "elem_name_" + field.getAttribute("name")

			li.setAttribute("id", comment_li_id)
			comment_div.setAttribute("id", comment_div_id);
			elem_name.setAttribute("id", elem_name_div_id);

			elem_name.setAttribute("class", "note");

			comment_div.setAttribute("class", "comment");
			comment_div.innerHTML = field.getAttribute("comment")
			li.appendChild(comment_div)

			post_draw.push(comment_management_function(elem_name_div_id,
					comment_div_id, comment_li_id))
		}
		ul.appendChild(li)
	}
	
	node.eachTag("mal:type",function(type){
		var li = document.createElement("li");
		li.innerHTML = str_mal_type(type)// str_mal_field(field)
		li.innerHTML += " "
		ul.appendChild(li)
	})
	
	td.appendChild(ul)
	row.appendChild(td)

	return row
}

function draw_errors(node) {
	// check if errors entry exists, if not, then exit
	if (node.childrenByTag("mal:errors", 0) == null) {
		return
	}

	// assumes only one entry
	var errorsNode = node.childrenByTag("mal:errors", 0)

	// first if entry exists
	if (errorsNode.childrenByTag("mal:errorRef", 0)) {
		var h2 = document.createElement("h2");
		h2.innerHTML = "Errors";
		div_main.appendChild(h2);

		// ------------------ first blue header ------------------
		var tbl = document.createElement("table");
		var tblBody = document.createElement("tbody");

		var header_row = tableRow(ERROR_HEADER);
		header_row.setAttribute("class", "blue_bg");
		tblBody.appendChild(header_row)

		errorsNode.eachTag("mal:errorRef", function(err) {
			// errors

			tblBody.appendChild(tr_errorRef(err))

		})
		// put the <tbody> in the <table>
		tbl.appendChild(tblBody);
		div_main.appendChild(tbl);

	}
}

function tr_errorRef(node) {
	var row = document.createElement("tr");

	// ------------- error type
	row.appendChild(td_with_text(str_mal_node_type(node)))

	// ------------- comment
	var comment = node.getAttribute("comment")
	if (typeof comment != 'undefined' && comment != null) {
		var unique = str_mal_node_type(node).replace(":", "_").replace("<", "_")
		.replace(">", "_")

		row.appendChild(td_table_comment(node.getAttribute("comment"),
		unique))

		//row.appendChild(td_with_text(comment))
	} else {
		row.appendChild(td_with_text(""))
	}

	if (node.childrenByTag("mal:extraInformation", 0)) {
		var extraInfo = node.childrenByTag("mal:extraInformation", 0)
		// ------------- Extra Info Type
		row.appendChild(td_with_text(str_mal_node_type(extraInfo)))

		// ------------- Extra Info Comment

		if (extraInfo.getAttribute("comment").length < TABLE_COMMENT_LENGTH_LIMIT) {
			row.appendChild(td_with_text(extraInfo.getAttribute("comment")))
		} else {
			row.appendChild(td_table_comment(extraInfo.getAttribute("comment")))
		}

	} else {
		row.appendChild(td_with_text("Not used", 2))
	}

	return row
}

function td_table_comment(full_comment, unique_sufix = null) {
	if(!unique_sufix){
		unique_sufix  = new Date() * Math.ceil((Math.random()*1000000))
	}
	 
	if (full_comment.length < TABLE_COMMENT_LENGTH_LIMIT)
		return td_with_text(full_comment);

	var shortComment = full_comment.split(/\s+/).slice(0,
			COMMENT_MIN_WORDS).join(" ")
			+ "..."

	var hidden_comment_div = document.createElement("div");
	var shown_comment_a = document.createElement("a");

	var hidden_comment_div_id = "hc_" + unique_sufix
	var shown_comment_a_id = "a_" + unique_sufix

	hidden_comment_div.setAttribute("id", hidden_comment_div_id);
	shown_comment_a.setAttribute("id", shown_comment_a_id);

	hidden_comment_div.setAttribute("class", "comment");
	shown_comment_a.setAttribute("class", "note");

	shown_comment_a.innerHTML = shortComment
	hidden_comment_div.innerHTML = full_comment
	

	var td = td_with_element(shown_comment_a)
	var td_id = "td_" + unique_sufix
	td.setAttribute("id", td_id);

	shown_comment_a.appendChild(hidden_comment_div)
	
	post_draw.push(comment_management_function(shown_comment_a_id,
			hidden_comment_div_id, td_id, 0.15, 1));

	return td
}

function draw_comments(node) {
	var comment = node.getAttribute("comment")
	if (typeof comment != 'undefined' && comment != null) {
		var h2 = document.createElement("h2");
		h2.innerHTML = "Comment";

		div_main.appendChild(h2);
		div_main.innerHTML += comment + "<br/>";
	}

	var note_counter = 1
	node.eachTag("mal:extraInformation", function(ei) {
		var h3 = document.createElement("h3");
		h3.innerHTML = "Note " + note_counter;

		div_main.appendChild(h3);
		div_main.innerHTML += ei.getAttribute("comment") + "<br/>";
		note_counter++
	})
}

drawers = {}

drawers["mal:documentation"] = d_mal_documentation
drawers["mal:area"] = d_mal_area
drawers["mal:service"] = d_mal_service

drawers["mal:sendIP"] = d_mal_ip
drawers["mal:submitIP"] = d_mal_ip
drawers["mal:requestIP"] = d_mal_ip
drawers["mal:invokeIP"] = d_mal_ip
drawers["mal:progressIP"] = d_mal_ip
drawers["mal:pubsubIP"] = d_mal_ip

drawers["mal:enumeration"] = d_mal_enum

drawers["mal:composite"] = d_mal_composite
drawers["default"] = default_drawer
