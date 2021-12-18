const SOURCE = `

<!-- inject-styles makes all of the styles accessible from this document -->
<import src="./tailwind.css" inject-styles />


<div export component as="Card" class="font-sans bg-gray-500 h-screen w-screen">
  <div class="bg-gray-100 rounded-lg p-8 md\:p-0">
    <div class="pt-6 text-center space-y-4">
      <blockquote>
        <p class="text-lg font-semibold">
          {description}
        </p>
      </blockquote>
      <figcaption class="font-medium">
        <div class="text-blue-600">
          {caption}
        </div>
      </figcaption>
    </div>
  </div>
</div>`;

export default SOURCE;
