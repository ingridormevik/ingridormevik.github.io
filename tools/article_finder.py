"""Find research beyond the book shelf, then cite the article actually read."""
from bs4 import BeautifulSoup


def articles(root):
    path = root / 'labs/academic-library.html'
    page = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    content = '''<section class="al-reading ar-lab" id="find-articles" aria-labelledby="ar-title">
<p class="al-tag">THE RESEARCH DESK / FOLLOW YOUR CURIOSITY</p>
<h2 id="ar-title">Go looking. The books here are a starting point.</h2>
<p>Google your idea. Try unfamiliar terms, follow an author's name and look at what an article cites. You do not need to know the perfect search words before you begin.</p>
<form class="ar-search" action="https://scholar.google.com/scholar" method="get" target="_blank" rel="noopener">
<label for="ar-query">Your form + something you want to understand<input id="ar-query" name="q" type="search" value="exploration games belonging" required=""/></label>
<div><button type="submit">Search Google Scholar ↗</button><button type="submit" formaction="https://www.google.com/search">Search Google ↗</button></div>
</form>
<div class="ar-stations">
<section><h3>Find the words</h3><p>Try two or three terms: <code>game interfaces</code>, <code>podcast identity</code> or <code>accessible app design</code>. Too few useful results? Drop a term or try a synonym. Put an exact article title in quotation marks.</p><p>In Google Scholar, try <strong>Related articles</strong> and <strong>Cited by</strong> to follow the discussion. A search result can be a thesis, preprint or review as well as a journal article.</p><a href="https://scholar.google.com/intl/en/scholar/help.html" target="_blank" rel="noopener">Google Scholar's search help</a></section>
<section><h3>Search Norwegian research with Sikt</h3><p>Open <strong>NVA, the Norwegian Research Information Repository</strong>, at <strong>nva.sikt.no</strong>. Search a topic, title or researcher, for example <code>Kristine Jørgensen</code>. You can search without logging in.</p><p>Use the filters to narrow by institution or result type. To look for downloadable material, use the uploaded-file filter. Open a record and check whether a file is available; some records contain information without full text.</p><a href="https://nva.sikt.no/" target="_blank" rel="noopener">Search NVA at Sikt ↗</a><a href="https://www.sikt.no/tjenester/nasjonalt-vitenarkiv-nva/hjelpeside-nva/brukerveiledninger-nva/sok-i-nva" target="_blank" rel="noopener">Sikt's step-by-step search guide</a></section>
<section><h3>Open and check the article</h3><p>Check the author, year, journal and article type on the publication record. If peer review matters for your task, check the journal's policy and the type of contribution. A PDF or a search ranking does not establish this.</p><p>Try a Scholar <strong>[PDF]</strong> link, <strong>All versions</strong>, NVA or your library's Oria access. Read beyond the abstract: what is the question, argument, evidence and limitation? Does it help with your particular design choice?</p><a href="https://oria.no/" target="_blank" rel="noopener">Find the article through your library</a><a href="#reading">Use it and cite it</a></section>
</div>
<p><strong>Try it now:</strong> find one relevant article, read the part that helps you, then return to one decision in your prototype. Cite the article you read, rather than Google, Scholar or Sikt.</p>
</section>'''
    page.select_one('.ge-full-table').insert_after(BeautifulSoup(content, 'html.parser').find())
    reading = page.select_one('#reading')
    reading.h2.string = 'Use the idea. Show where it came from.'
    reading.select_one('ol > li').string = 'For an article, use the abstract, introduction and conclusion to judge relevance, then read its argument and evidence in context. For a book, locate a relevant chapter and identify its author.'
    citation = '''<section class="ar-citation" id="chicago-author-date" aria-labelledby="ar-cite-title">
<p class="al-tag">CITATION BENCH / CHICAGO AUTHOR-DATE</p>
<h3 id="ar-cite-title">A short citation in your text. The full article in your reference list.</h3>
<p>Chicago author-date uses parentheses in the text and an alphabetical reference list. Cite paraphrased ideas too. Follow your assignment's instructions.</p>
<div class="ar-example"><h4>In your text</h4><p>When referring to the article as a whole: <code>(Jørgensen 2012)</code>.</p><p>For a passage you have read on page 142: <code>(Jørgensen 2012, 142)</code>. Use the page you actually discuss. Quoted words also need quotation marks.</p><h4>In your reference list</h4><p class="ar-reference">Jørgensen, Kristine. 2012. “Between the Game System and the Fictional World: A Study of Computer Game Interfaces.” <cite>Games and Culture</cite> 7 (2): 142–63. <a href="https://doi.org/10.1177/1555412012440315" target="_blank" rel="noopener">https://doi.org/10.1177/1555412012440315</a>.</p><p>This is a real journal article. The citation demonstrates the format; it is not a quotation or a claim about a particular passage. <a href="https://journals.sagepub.com/doi/10.1177/1555412012440315" target="_blank" rel="noopener">Check the publisher's record</a>.</p></div>
<details><summary>Build the reference from your article's details</summary>
<p><strong>Pattern:</strong> Surname, First name. Year. “Article Title.” <cite>Journal Title</cite> volume (issue): full article page range or article ID. DOI link.</p>
<p>The article title uses quotation marks; the journal title is italic. Give the whole article's pages in the reference and the passage's page in the text. Prefer a DOI link when available.</p>
<p>In the text, name both authors for a two-author work. For three or more, use the first surname plus <code>et al.</code> Check the official guide for reference-list names.</p>
<p>No stable pages? Use an appropriate section or locator. Check generated citations against the record. A DOI identifies a work; it does not establish quality.</p></details>
<p><a href="https://www.chicagomanualofstyle.org/tools_citationguide/citation-guide-2.html" target="_blank" rel="noopener">Official Chicago author-date examples, including journal articles</a></p>
</section>'''
    reading.select_one('ol').insert_after(BeautifulSoup(citation, 'html.parser').find())
    page.select_one('#rf-result').append(BeautifulSoup('<p><a href="#find-articles">Find an article with Google, Google Scholar or Sikt</a></p>', 'html.parser').find())
    page.select_one('.lc-course-link').append(BeautifulSoup(' · <a href="#find-articles">Find an article</a> · <a href="#chicago-author-date">Cite it</a>', 'html.parser'))
    path.write_text(str(page), encoding='utf-8', newline='\n')
