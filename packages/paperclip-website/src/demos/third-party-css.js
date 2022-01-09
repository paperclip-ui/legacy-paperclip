const SOURCE = `

<!-- You can share CSS scope with imported files -->
<import src="modules/tailwind.css" inject-styles />

<!-- Or you can keep imported modules in their own namespace -->
<import src="modules/animate.css" as="animate" />

<!-- Here we're just using the animate.css scope with this primitive Card component -->
<div export component as="Card" class="$animate animate__animated animate__bounceIn bg-gray-500 h-screen w-screen">
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
