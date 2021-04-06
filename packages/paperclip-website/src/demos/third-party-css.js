const SOURCE = `
<import src="./tailwind.css" inject-styles />


<!--
  @frame { width: 768, height: 768, x: 0, y: 0 }
-->

<div class="font-sans bg-gray-500 h-screen w-screen">
  <div class="bg-gray-100 rounded-lg p-8 md\:p-0">
    <div class="pt-6 text-center space-y-4">
      <blockquote>
        <p class="text-lg font-semibold">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </blockquote>
      <figcaption class="font-medium">
        <div class="text-blue-600">
          sit voluptatem
        </div>
      </figcaption>
    </div>
  </div>
</div>`;

export default SOURCE;
