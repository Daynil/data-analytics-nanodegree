## Udacity D3.js Final Project

### Summary

The data is from the peer to peer lending company [Prosper](https://www.prosper.com/), and contains a historic look at over 113,000 loans, with extensive financial data like whether the loan was completed or defaulted, the loan's APR, and various pieces of information regarding the borrower's credit history.

I chose this dataset because I've always had a strong interest in finance, especially as it relates to financial investment and returns. I was curious to dig in and see what type of information could be gleaned from this large, open dataset.



### Design

My initial design after exploring the data was a heatmap. This dataset had an enormous amount of rows, so I felt it necessary to aggregate the data in order to create a structured, sensible view of my results. 

I wanted to create a story out of the data that showed what I discovered during the exploratory phase, which involved how 3 different variables related to the intersection of income range vs. prosper score, so I decided to add a button with a short explanation of each graph guiding the reader to go through each variable.

I iterated on a few color schemas before settling on the yellow-green theme. I though a transparent-green theme didn't show off the differences between the data enough to have the desired impact. The legend was necessary to provide context for the colors.

After feedback, I realized it wasn't clear enough what the values of each heatmap block were, so I added a tooltip on hover to show the exact values, and it added more interactivity in the exploration of the data, as well as adding more granularity to the data upon interaction.

I also changed the rounding of the revolving credit balance to round to the thousands. The scale is relative, and shouldn't display precise values for each color, especially since the precision isn't perceivable.



### Feedback

I showed my initial iteration to 3 people to get their feedback. The following was the feedback I received:

* Can't tell what the color variable value is, especially on the ones that are close to each other and the color difference is slight
* Revolving credit balance was too precisely rounded on the legend, which looked unnatural for a "scale" to show
* People liked the button creating changes in the graph, which clearly showed how the various variables interacted differently with prosper score and income range.



### References

https://stackoverflow.com/questions/17671252/d3-create-a-continuous-color-scale-with-many-strings-inputs-for-the-range-and-d

http://bl.ocks.org/AndrewStaroscik/5222370

https://github.com/d3/d3-3.x-api-reference/blob/master/API-Reference.md

http://bl.ocks.org/bewest/5075497